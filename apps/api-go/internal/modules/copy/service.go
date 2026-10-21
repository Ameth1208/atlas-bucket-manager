package copy

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/database"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/domain"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/s3"
	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
)

type EventListener func(event string, job *domain.CopyJob)

type Service struct {
	db        *database.DB
	s3        *s3.Manager
	cancels   map[string]context.CancelFunc
	listeners []EventListener
	mu        sync.RWMutex
}

func NewService(db *database.DB, s3Mgr *s3.Manager) *Service {
	return &Service{
		db:      db,
		s3:      s3Mgr,
		cancels: make(map[string]context.CancelFunc),
	}
}

func (s *Service) OnEvent(fn EventListener) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.listeners = append(s.listeners, fn)
}

func (s *Service) emit(event string, job *domain.CopyJob) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	for _, fn := range s.listeners {
		go fn(event, job)
	}
}

func (s *Service) List() ([]domain.CopyJob, error) {
	rows, err := s.db.Query(`
		SELECT id, actor, source_provider_id, source_bucket, dest_provider_id, dest_bucket,
		       prefix, overwrite, status, total_objects, copied_objects, total_bytes, copied_bytes,
		       errors_json, started_at, finished_at
		FROM copy_jobs ORDER BY started_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []domain.CopyJob
	for rows.Next() {
		var job domain.CopyJob
		var overwriteInt int
		var errorsJSON string
		if err := rows.Scan(
			&job.ID, &job.Actor, &job.SourceProviderID, &job.SourceBucket, &job.DestProviderID, &job.DestBucket,
			&job.Prefix, &overwriteInt, &job.Status, &job.TotalObjects, &job.CopiedObjects,
			&job.TotalBytes, &job.CopiedBytes, &errorsJSON, &job.StartedAt, &job.FinishedAt,
		); err != nil {
			return nil, err
		}
		job.Overwrite = overwriteInt == 1
		_ = json.Unmarshal([]byte(errorsJSON), &job.Errors)
		if job.Errors == nil {
			job.Errors = []domain.CopyJobError{}
		}
		result = append(result, job)
	}
	if result == nil {
		result = []domain.CopyJob{}
	}
	return result, nil
}

func (s *Service) Get(id string) (*domain.CopyJob, error) {
	var job domain.CopyJob
	var overwriteInt int
	var errorsJSON string
	err := s.db.QueryRow(`
		SELECT id, actor, source_provider_id, source_bucket, dest_provider_id, dest_bucket,
		       prefix, overwrite, status, total_objects, copied_objects, total_bytes, copied_bytes,
		       errors_json, started_at, finished_at
		FROM copy_jobs WHERE id = ?
	`, id).Scan(
		&job.ID, &job.Actor, &job.SourceProviderID, &job.SourceBucket, &job.DestProviderID, &job.DestBucket,
		&job.Prefix, &overwriteInt, &job.Status, &job.TotalObjects, &job.CopiedObjects,
		&job.TotalBytes, &job.CopiedBytes, &errorsJSON, &job.StartedAt, &job.FinishedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("job not found")
		}
		return nil, err
	}
	job.Overwrite = overwriteInt == 1
	_ = json.Unmarshal([]byte(errorsJSON), &job.Errors)
	if job.Errors == nil {
		job.Errors = []domain.CopyJobError{}
	}
	return &job, nil
}

func (s *Service) Start(body domain.StartCopyBody, actor string) (*domain.CopyJob, error) {
	id := uuid.New().String()
	now := time.Now().Unix()

	overwriteVal := 0
	if body.Overwrite {
		overwriteVal = 1
	}

	_, err := s.db.Exec(`
		INSERT INTO copy_jobs (
			id, actor, source_provider_id, source_bucket, dest_provider_id, dest_bucket,
			prefix, overwrite, status, started_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'queued', ?)
	`, id, actor, body.SourceProviderID, body.SourceBucket, body.DestProviderID, body.DestBucket, body.Prefix, overwriteVal, now)
	if err != nil {
		return nil, err
	}

	job := &domain.CopyJob{
		ID:               id,
		Actor:            actor,
		SourceProviderID: body.SourceProviderID,
		SourceBucket:     body.SourceBucket,
		DestProviderID:   body.DestProviderID,
		DestBucket:       body.DestBucket,
		Prefix:           body.Prefix,
		Overwrite:        body.Overwrite,
		Status:           domain.CopyStatusQueued,
		Errors:           []domain.CopyJobError{},
		StartedAt:        now,
	}

	ctx, cancel := context.WithCancel(context.Background())
	s.mu.Lock()
	s.cancels[id] = cancel
	s.mu.Unlock()

	go s.runJob(ctx, job)

	return job, nil
}

func (s *Service) runJob(ctx context.Context, job *domain.CopyJob) {
	defer func() {
		s.mu.Lock()
		delete(s.cancels, job.ID)
		s.mu.Unlock()
	}()

	srcClient, err := s.s3.GetClient(job.SourceProviderID)
	if err != nil {
		s.failJob(job, fmt.Sprintf("cannot connect to source provider: %v", err))
		return
	}

	destClient, err := s.s3.GetClient(job.DestProviderID)
	if err != nil {
		s.failJob(job, fmt.Sprintf("cannot connect to dest provider: %v", err))
		return
	}

	// Update to running
	job.Status = domain.CopyStatusRunning
	_, _ = s.db.Exec("UPDATE copy_jobs SET status = 'running' WHERE id = ?", job.ID)
	s.emit("copy:progress", job)

	// List source objects
	prefix := ""
	if job.Prefix != nil {
		prefix = *job.Prefix
	}
	opts := minio.ListObjectsOptions{Prefix: prefix, Recursive: true}

	var items []minio.ObjectInfo
	for obj := range srcClient.ListObjects(ctx, job.SourceBucket, opts) {
		if ctx.Err() != nil {
			s.cancelJob(job)
			return
		}
		if obj.Err == nil && obj.Key != "" {
			items = append(items, obj)
			job.TotalObjects++
			job.TotalBytes += obj.Size
		}
	}

	_, _ = s.db.Exec("UPDATE copy_jobs SET total_objects = ?, total_bytes = ? WHERE id = ?",
		job.TotalObjects, job.TotalBytes, job.ID)
	s.emit("copy:progress", job)

	if len(items) == 0 {
		s.completeJob(job)
		return
	}

	// Worker pool with goroutines
	concurrency := 8
	jobsChan := make(chan minio.ObjectInfo, len(items))
	for _, it := range items {
		jobsChan <- it
	}
	close(jobsChan)

	var wg sync.WaitGroup
	var progressMu sync.Mutex

	for i := 0; i < concurrency; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for item := range jobsChan {
				if ctx.Err() != nil {
					return
				}

				// Check overwrite if false
				if !job.Overwrite {
					_, err := destClient.StatObject(ctx, job.DestBucket, item.Key, minio.StatObjectOptions{})
					if err == nil {
						// Object already exists, skip
						progressMu.Lock()
						job.CopiedObjects++
						job.CopiedBytes += item.Size
						progressMu.Unlock()
						continue
					}
				}

				// Stream from source to dest
				srcObj, err := srcClient.GetObject(ctx, job.SourceBucket, item.Key, minio.GetObjectOptions{})
				if err != nil {
					progressMu.Lock()
					job.Errors = append(job.Errors, domain.CopyJobError{Key: item.Key, Message: err.Error()})
					progressMu.Unlock()
					continue
				}

				_, err = destClient.PutObject(ctx, job.DestBucket, item.Key, srcObj, item.Size, minio.PutObjectOptions{
					ContentType: item.ContentType,
				})
				srcObj.Close()

				progressMu.Lock()
				if err != nil {
					job.Errors = append(job.Errors, domain.CopyJobError{Key: item.Key, Message: err.Error()})
				} else {
					job.CopiedObjects++
					job.CopiedBytes += item.Size
				}
				progressMu.Unlock()

				// Update progress in DB periodically
				if job.CopiedObjects%10 == 0 || job.CopiedObjects == job.TotalObjects {
					s.updateProgress(job)
				}
			}
		}()
	}

	wg.Wait()

	if ctx.Err() != nil {
		s.cancelJob(job)
		return
	}

	s.completeJob(job)
}

func (s *Service) updateProgress(job *domain.CopyJob) {
	errorsJSON, _ := json.Marshal(job.Errors)
	_, _ = s.db.Exec(`
		UPDATE copy_jobs
		SET copied_objects = ?, copied_bytes = ?, errors_json = ?
		WHERE id = ?
	`, job.CopiedObjects, job.CopiedBytes, string(errorsJSON), job.ID)
	s.emit("copy:progress", job)
}

func (s *Service) completeJob(job *domain.CopyJob) {
	now := time.Now().Unix()
	job.FinishedAt = &now
	job.Status = domain.CopyStatusCompleted
	if len(job.Errors) > 0 && job.CopiedObjects == 0 {
		job.Status = domain.CopyStatusFailed
	}

	errorsJSON, _ := json.Marshal(job.Errors)
	_, _ = s.db.Exec(`
		UPDATE copy_jobs
		SET status = ?, copied_objects = ?, copied_bytes = ?, errors_json = ?, finished_at = ?
		WHERE id = ?
	`, string(job.Status), job.CopiedObjects, job.CopiedBytes, string(errorsJSON), now, job.ID)

	if job.Status == domain.CopyStatusCompleted {
		s.emit("copy:completed", job)
	} else {
		s.emit("copy:failed", job)
	}
}

func (s *Service) failJob(job *domain.CopyJob, reason string) {
	now := time.Now().Unix()
	job.FinishedAt = &now
	job.Status = domain.CopyStatusFailed
	job.Errors = append(job.Errors, domain.CopyJobError{Key: "*", Message: reason})

	errorsJSON, _ := json.Marshal(job.Errors)
	_, _ = s.db.Exec(`
		UPDATE copy_jobs
		SET status = 'failed', errors_json = ?, finished_at = ?
		WHERE id = ?
	`, string(errorsJSON), now, job.ID)
	s.emit("copy:failed", job)
}

func (s *Service) cancelJob(job *domain.CopyJob) {
	now := time.Now().Unix()
	job.FinishedAt = &now
	job.Status = domain.CopyStatusCancelled

	_, _ = s.db.Exec(`
		UPDATE copy_jobs SET status = 'cancelled', finished_at = ? WHERE id = ?
	`, now, job.ID)
	s.emit("copy:cancelled", job)
}

func (s *Service) Cancel(id string) (*domain.CopyJob, error) {
	s.mu.Lock()
	if cancel, ok := s.cancels[id]; ok {
		cancel()
	}
	s.mu.Unlock()

	return s.Get(id)
}

func (s *Service) Delete(id string) error {
	res, err := s.db.Exec("DELETE FROM copy_jobs WHERE id = ?", id)
	if err != nil {
		return err
	}
	affected, _ := res.RowsAffected()
	if affected == 0 {
		return errors.New("job not found")
	}
	return nil
}
