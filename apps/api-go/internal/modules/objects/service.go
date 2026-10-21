package objects

import (
	"archive/zip"
	"context"
	"database/sql"
	"errors"
	"fmt"
	"io"
	"net/url"
	"path"
	"strings"
	"time"

	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/database"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/domain"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/s3"
	"github.com/minio/minio-go/v7"
)

type Service struct {
	db *database.DB
	s3 *s3.Manager
}

func NewService(db *database.DB, s3Mgr *s3.Manager) *Service {
	return &Service{db: db, s3: s3Mgr}
}

func (s *Service) List(ctx context.Context, providerID, bucket, prefix string) ([]domain.StorageObject, error) {
	client, err := s.s3.GetClient(providerID)
	if err != nil {
		return nil, err
	}

	opts := minio.ListObjectsOptions{
		Prefix:    prefix,
		Recursive: false,
	}

	seen := make(map[string]bool)
	var list []domain.StorageObject

	for obj := range client.ListObjects(ctx, bucket, opts) {
		if obj.Err != nil {
			return nil, obj.Err
		}

		key := obj.Key
		if key == "" || seen[key] {
			continue
		}
		seen[key] = true

		isFolder := strings.HasSuffix(key, "/")
		var modStr string
		if !obj.LastModified.IsZero() {
			modStr = obj.LastModified.Format(time.RFC3339)
		}

		list = append(list, domain.StorageObject{
			Key:          key,
			Size:         obj.Size,
			LastModified: modStr,
			ETag:         obj.ETag,
			IsFolder:     isFolder,
		})
	}

	if list == nil {
		list = []domain.StorageObject{}
	}
	return list, nil
}

func (s *Service) Search(ctx context.Context, bucket, providerID, query string) ([]domain.StorageObject, error) {
	client, err := s.s3.GetClient(providerID)
	if err != nil {
		return nil, err
	}

	opts := minio.ListObjectsOptions{
		Recursive: true,
	}

	qLower := strings.ToLower(query)
	var results []domain.StorageObject

	for obj := range client.ListObjects(ctx, bucket, opts) {
		if obj.Err == nil && obj.Key != "" {
			if strings.Contains(strings.ToLower(obj.Key), qLower) {
				results = append(results, domain.StorageObject{
					Key:          obj.Key,
					Size:         obj.Size,
					LastModified: obj.LastModified.Format(time.RFC3339),
					ETag:         obj.ETag,
					IsFolder:     strings.HasSuffix(obj.Key, "/"),
				})
			}
		}
	}

	if results == nil {
		results = []domain.StorageObject{}
	}
	return results, nil
}

func (s *Service) FileTypes(ctx context.Context) ([]domain.FileTypeCount, error) {
	providers, err := s.s3.ListProviders()
	if err != nil {
		return nil, err
	}

	categoryCounts := make(map[string]int)
	categorySizes := make(map[string]int64)

	for _, p := range providers {
		client, err := s.s3.GetClient(p.ID)
		if err != nil {
			continue
		}

		buckets, err := client.ListBuckets(ctx)
		if err != nil {
			continue
		}

		for _, b := range buckets {
			opts := minio.ListObjectsOptions{Recursive: true}
			for obj := range client.ListObjects(ctx, b.Name, opts) {
				if obj.Err == nil && obj.Key != "" && !strings.HasSuffix(obj.Key, "/") {
					cat := GetCategory(obj.Key)
					categoryCounts[cat]++
					categorySizes[cat] += obj.Size
				}
			}
		}
	}

	categories := []string{"Images", "Documents", "Media", "Archives", "Code", "Other"}
	var result []domain.FileTypeCount
	for _, cat := range categories {
		result = append(result, domain.FileTypeCount{
			Type:  cat,
			Count: categoryCounts[cat],
			Size:  categorySizes[cat],
		})
	}

	return result, nil
}

func (s *Service) PresignedURL(ctx context.Context, providerID, bucket, key string) (string, error) {
	client, err := s.s3.GetClient(providerID)
	if err != nil {
		return "", err
	}

	reqParams := make(url.Values)
	u, err := client.PresignedGetObject(ctx, bucket, key, 1*time.Hour, reqParams)
	if err != nil {
		return "", err
	}
	return u.String(), nil
}

func (s *Service) Stream(ctx context.Context, providerID, bucket, key string) (*minio.Object, string, string, error) {
	client, err := s.s3.GetClient(providerID)
	if err != nil {
		return nil, "", "", err
	}

	obj, err := client.GetObject(ctx, bucket, key, minio.GetObjectOptions{})
	if err != nil {
		return nil, "", "", err
	}

	stat, err := obj.Stat()
	if err != nil {
		obj.Close()
		return nil, "", "", err
	}

	fileName := path.Base(key)
	mime := stat.ContentType
	if mime == "" || mime == "application/octet-stream" {
		mime = GetMimeType(fileName)
	}

	return obj, mime, fileName, nil
}

func (s *Service) CreateFolder(ctx context.Context, providerID, bucket, folderName, prefix string) error {
	client, err := s.s3.GetClient(providerID)
	if err != nil {
		return err
	}

	cleanPrefix := strings.Trim(prefix, "/")
	cleanFolder := strings.Trim(folderName, "/")

	var fullPath string
	if cleanPrefix != "" {
		fullPath = fmt.Sprintf("%s/%s/", cleanPrefix, cleanFolder)
	} else {
		fullPath = fmt.Sprintf("%s/", cleanFolder)
	}

	emptyReader := strings.NewReader("")
	_, err = client.PutObject(ctx, bucket, fullPath, emptyReader, 0, minio.PutObjectOptions{
		ContentType: "application/x-directory",
	})
	return err
}

func (s *Service) Delete(ctx context.Context, providerID, bucket string, keys []string) error {
	client, err := s.s3.GetClient(providerID)
	if err != nil {
		return err
	}

	objectsCh := make(chan minio.ObjectInfo)
	go func() {
		defer close(objectsCh)
		for _, key := range keys {
			if strings.HasSuffix(key, "/") {
				// Recursive folder deletion
				opts := minio.ListObjectsOptions{Prefix: key, Recursive: true}
				for child := range client.ListObjects(ctx, bucket, opts) {
					if child.Err == nil && child.Key != "" {
						objectsCh <- minio.ObjectInfo{Key: child.Key}
					}
				}
			} else {
				objectsCh <- minio.ObjectInfo{Key: key}
			}
		}
	}()

	for err := range client.RemoveObjects(ctx, bucket, objectsCh, minio.RemoveObjectsOptions{}) {
		if err.Err != nil {
			return err.Err
		}
	}

	return nil
}

func (s *Service) Upload(ctx context.Context, providerID, bucket string, objectName string, reader io.Reader, size int64, contentType string) error {
	client, err := s.s3.GetClient(providerID)
	if err != nil {
		return err
	}

	// Check bucket limit quota
	var maxSize sql.NullInt64
	_ = s.db.QueryRow("SELECT max_size FROM bucket_configs WHERE provider_id = ? AND name = ?", providerID, bucket).Scan(&maxSize)
	if maxSize.Valid && maxSize.Int64 > 0 {
		var currentSize int64
		opts := minio.ListObjectsOptions{Recursive: true}
		for obj := range client.ListObjects(ctx, bucket, opts) {
			if obj.Err == nil && !strings.HasSuffix(obj.Key, "/") {
				currentSize += obj.Size
			}
		}
		if currentSize+size > maxSize.Int64 {
			return fmt.Errorf("bucket limit reached: maximum capacity is %d bytes", maxSize.Int64)
		}
	}

	if contentType == "" {
		contentType = GetMimeType(objectName)
	}

	_, err = client.PutObject(ctx, bucket, objectName, reader, size, minio.PutObjectOptions{
		ContentType: contentType,
	})
	return err
}

func (s *Service) StreamZip(ctx context.Context, providerID, bucket string, prefix string, keys []string, writer io.Writer) error {
	client, err := s.s3.GetClient(providerID)
	if err != nil {
		return err
	}

	zipWriter := zip.NewWriter(writer)
	defer zipWriter.Close()

	var keysToStream []string
	if len(keys) > 0 {
		for _, k := range keys {
			if strings.HasSuffix(k, "/") {
				// Expand folder
				opts := minio.ListObjectsOptions{Prefix: k, Recursive: true}
				for child := range client.ListObjects(ctx, bucket, opts) {
					if child.Err == nil && child.Key != "" && !strings.HasSuffix(child.Key, "/") {
						keysToStream = append(keysToStream, child.Key)
					}
				}
			} else {
				keysToStream = append(keysToStream, k)
			}
		}
	} else {
		opts := minio.ListObjectsOptions{Prefix: prefix, Recursive: true}
		for obj := range client.ListObjects(ctx, bucket, opts) {
			if obj.Err == nil && obj.Key != "" && !strings.HasSuffix(obj.Key, "/") {
				keysToStream = append(keysToStream, obj.Key)
			}
		}
	}

	if len(keysToStream) == 0 {
		return errors.New("no objects to include in zip")
	}

	// Base prefix for relative path inside zip
	basePrefix := prefix
	if basePrefix != "" && !strings.HasSuffix(basePrefix, "/") {
		basePrefix += "/"
	}

	for _, key := range keysToStream {
		entryName := key
		if basePrefix != "" && strings.HasPrefix(key, basePrefix) {
			entryName = strings.TrimPrefix(key, basePrefix)
		}

		obj, err := client.GetObject(ctx, bucket, key, minio.GetObjectOptions{})
		if err != nil {
			continue
		}

		stat, err := obj.Stat()
		if err != nil {
			obj.Close()
			continue
		}

		header := &zip.FileHeader{
			Name:     entryName,
			Method:   zip.Deflate,
			Modified: stat.LastModified,
		}

		entryWriter, err := zipWriter.CreateHeader(header)
		if err != nil {
			obj.Close()
			return err
		}

		_, err = io.Copy(entryWriter, obj)
		obj.Close()
		if err != nil {
			return err
		}
	}

	return nil
}
