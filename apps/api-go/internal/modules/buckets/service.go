package buckets

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"regexp"
	"sync"
	"time"

	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/database"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/domain"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/s3"
	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
)

var s3BucketRegex = regexp.MustCompile(`^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$`)

type Service struct {
	db *database.DB
	s3 *s3.Manager
}

func NewService(db *database.DB, s3Mgr *s3.Manager) *Service {
	return &Service{db: db, s3: s3Mgr}
}

func (s *Service) List(ctx context.Context, userID string) (*domain.BucketsListResult, error) {
	providers, err := s.s3.ListProviders()
	if err != nil {
		return nil, err
	}

	// Fetch favorites for user
	favorites := make(map[string]bool)
	if userID != "" {
		rows, err := s.db.Query("SELECT provider_id, bucket_name FROM favorites WHERE user_id = ?", userID)
		if err == nil {
			defer rows.Close()
			for rows.Next() {
				var pid, bname string
				if err := rows.Scan(&pid, &bname); err == nil {
					favorites[fmt.Sprintf("%s:%s", pid, bname)] = true
				}
			}
		}
	}

	var allBuckets []domain.Bucket
	var providerErrors []domain.ProviderListError

	for _, p := range providers {
		client, err := s.s3.GetClient(p.ID)
		if err != nil {
			providerErrors = append(providerErrors, domain.ProviderListError{
				ProviderID:   p.ID,
				ProviderName: p.Name,
				Error:        err.Error(),
			})
			continue
		}

		timeoutCtx, cancel := context.WithTimeout(ctx, 6*time.Second)
		bList, err := client.ListBuckets(timeoutCtx)
		cancel()

		if err != nil {
			providerErrors = append(providerErrors, domain.ProviderListError{
				ProviderID:   p.ID,
				ProviderName: p.Name,
				Error:        err.Error(),
			})
			continue
		}

		for _, b := range bList {
			creationStr := b.CreationDate.Format(time.RFC3339)
			isFav := favorites[fmt.Sprintf("%s:%s", p.ID, b.Name)]

			var isPublicInt int
			var maxSize sql.NullInt64
			_ = s.db.QueryRow(`
				SELECT is_public, max_size FROM bucket_configs WHERE provider_id = ? AND name = ?
			`, p.ID, b.Name).Scan(&isPublicInt, &maxSize)

			var limitPtr *int64
			if maxSize.Valid {
				limitPtr = &maxSize.Int64
			}

			allBuckets = append(allBuckets, domain.Bucket{
				Name:         b.Name,
				CreationDate: &creationStr,
				ProviderID:   p.ID,
				ProviderName: p.Name,
				IsPublic:     isPublicInt == 1,
				IsFavorite:   isFav,
				Limit:        limitPtr,
			})
		}
	}

	if allBuckets == nil {
		allBuckets = []domain.Bucket{}
	}
	if providerErrors == nil {
		providerErrors = []domain.ProviderListError{}
	}

	return &domain.BucketsListResult{
		Buckets:        allBuckets,
		ProviderErrors: providerErrors,
	}, nil
}

func (s *Service) Create(ctx context.Context, providerID, name string, limit *int64) error {
	if len(name) < 3 || len(name) > 63 || !s3BucketRegex.MatchString(name) {
		return errors.New("bucket name must be between 3 and 63 characters and follow S3 naming conventions")
	}

	client, err := s.s3.GetClient(providerID)
	if err != nil {
		return err
	}

	if err := client.MakeBucket(ctx, name, minio.MakeBucketOptions{}); err != nil {
		return err
	}

	id := uuid.New().String()
	now := time.Now().Unix()

	_, err = s.db.Exec(`
		INSERT INTO bucket_configs (id, provider_id, name, is_public, max_size, created_at)
		VALUES (?, ?, ?, 0, ?, ?)
	`, id, providerID, name, limit, now)

	return err
}

func (s *Service) Remove(ctx context.Context, providerID, name string) error {
	client, err := s.s3.GetClient(providerID)
	if err != nil {
		return err
	}

	// Empty objects in bucket
	opts := minio.ListObjectsOptions{Recursive: true}
	objectsCh := client.ListObjects(ctx, name, opts)
	for obj := range objectsCh {
		if obj.Err == nil && obj.Key != "" {
			_ = client.RemoveObject(ctx, name, obj.Key, minio.RemoveObjectOptions{})
		}
	}

	if err := client.RemoveBucket(ctx, name); err != nil {
		return err
	}

	_, _ = s.db.Exec("DELETE FROM bucket_configs WHERE provider_id = ? AND name = ?", providerID, name)
	_, _ = s.db.Exec("DELETE FROM favorites WHERE provider_id = ? AND bucket_name = ?", providerID, name)

	return nil
}

func (s *Service) SetVisibility(ctx context.Context, providerID, name string, isPublic bool) error {
	client, err := s.s3.GetClient(providerID)
	if err != nil {
		return err
	}

	var policy string
	if isPublic {
		policy = fmt.Sprintf(`{
			"Version": "2012-10-17",
			"Statement": [
				{
					"Effect": "Allow",
					"Principal": "*",
					"Action": ["s3:GetObject"],
					"Resource": ["arn:aws:s3:::%s/*"]
				}
			]
		}`, name)
	}

	_ = client.SetBucketPolicy(ctx, name, policy)

	isPublicInt := 0
	if isPublic {
		isPublicInt = 1
	}

	_, err = s.db.Exec(`
		INSERT INTO bucket_configs (id, provider_id, name, is_public, created_at)
		VALUES (?, ?, ?, ?, ?)
		ON CONFLICT(provider_id, name) DO UPDATE SET is_public = ?
	`, uuid.New().String(), providerID, name, isPublicInt, time.Now().Unix(), isPublicInt)

	return err
}

func (s *Service) SetLimit(providerID, name string, limit *int64) error {
	_, err := s.db.Exec(`
		INSERT INTO bucket_configs (id, provider_id, name, is_public, max_size, created_at)
		VALUES (?, ?, ?, 0, ?, ?)
		ON CONFLICT(provider_id, name) DO UPDATE SET max_size = ?
	`, uuid.New().String(), providerID, name, limit, time.Now().Unix(), limit)
	return err
}

func (s *Service) Stats(ctx context.Context, providerID, name string) (*domain.BucketStats, error) {
	client, err := s.s3.GetClient(providerID)
	if err != nil {
		return nil, err
	}

	var count int64
	var size int64

	opts := minio.ListObjectsOptions{Recursive: true}
	for obj := range client.ListObjects(ctx, name, opts) {
		if obj.Err == nil && obj.Key != "" && obj.Key[len(obj.Key)-1] != '/' {
			count++
			size += obj.Size
		}
	}

	var maxSize sql.NullInt64
	_ = s.db.QueryRow("SELECT max_size FROM bucket_configs WHERE provider_id = ? AND name = ?", providerID, name).Scan(&maxSize)

	var limitPtr *int64
	if maxSize.Valid {
		limitPtr = &maxSize.Int64
	}

	return &domain.BucketStats{
		TotalObjects: count,
		TotalSize:    size,
		Limit:        limitPtr,
		ProviderID:   providerID,
	}, nil
}

func (s *Service) StatsMany(ctx context.Context, userID string) (map[string]domain.BucketStats, error) {
	listRes, err := s.List(ctx, userID)
	if err != nil {
		return nil, err
	}

	results := make(map[string]domain.BucketStats)
	var mu sync.Mutex
	var wg sync.WaitGroup

	sem := make(chan struct{}, 8) // max 8 concurrent stats walks

	for _, b := range listRes.Buckets {
		wg.Add(1)
		go func(bucket domain.Bucket) {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()

			stats, err := s.Stats(ctx, bucket.ProviderID, bucket.Name)
			if err == nil && stats != nil {
				key := fmt.Sprintf("%s:%s", bucket.ProviderID, bucket.Name)
				mu.Lock()
				results[key] = *stats
				mu.Unlock()
			}
		}(b)
	}

	wg.Wait()
	return results, nil
}

func (s *Service) PublicEndpoint(providerID, name string) (*string, error) {
	var isPublicInt int
	err := s.db.QueryRow("SELECT is_public FROM bucket_configs WHERE provider_id = ? AND name = ?", providerID, name).Scan(&isPublicInt)
	if err != nil || isPublicInt != 1 {
		return nil, errors.New("bucket is not public")
	}

	provider, err := s.s3.FindProvider(providerID)
	if err != nil || provider == nil {
		return nil, errors.New("provider not found")
	}

	proto := "http"
	if provider.UseSSL {
		proto = "https"
	}

	portSeg := ""
	if (provider.UseSSL && provider.Port != 443) || (!provider.UseSSL && provider.Port != 80) {
		portSeg = fmt.Sprintf(":%d", provider.Port)
	}

	url := fmt.Sprintf("%s://%s%s/%s", proto, provider.EndPoint, portSeg, name)
	return &url, nil
}
