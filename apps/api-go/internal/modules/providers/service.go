package providers

import (
	"context"
	"errors"
	"time"

	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/database"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/domain"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/s3"
	"github.com/google/uuid"
)

type Service struct {
	db *database.DB
	s3 *s3.Manager
}

func NewService(db *database.DB, s3Mgr *s3.Manager) *Service {
	return &Service{db: db, s3: s3Mgr}
}

func (s *Service) List() ([]domain.Provider, error) {
	return s.s3.ListProviders()
}

func (s *Service) Get(id string) (*domain.Provider, error) {
	return s.s3.FindProvider(id)
}

func (s *Service) Create(ctx context.Context, p *domain.Provider) (*domain.Provider, error) {
	if p.Region == "" {
		p.Region = "us-east-1"
	}

	// Test connection
	if err := s.s3.TestConnection(ctx, p); err != nil {
		return nil, errors.New("cannot connect to provider: " + err.Error())
	}

	p.ID = uuid.New().String()
	p.CreatedAt = time.Now().Unix()

	useSSLInt := 0
	if p.UseSSL {
		useSSLInt = 1
	}

	_, err := s.db.Exec(`
		INSERT INTO provider_configs (id, name, kind, endpoint, port, use_ssl, access_key, secret_key, region, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, p.ID, p.Name, p.Kind, p.EndPoint, p.Port, useSSLInt, p.AccessKey, p.SecretKey, p.Region, p.CreatedAt)
	if err != nil {
		return nil, err
	}

	return p, nil
}

func (s *Service) Update(ctx context.Context, id string, p *domain.Provider) (*domain.Provider, error) {
	existing, err := s.s3.FindProvider(id)
	if err != nil {
		return nil, err
	}

	// Check if connection credentials changed
	credsChanged := existing.EndPoint != p.EndPoint ||
		existing.Port != p.Port ||
		existing.UseSSL != p.UseSSL ||
		existing.AccessKey != p.AccessKey ||
		existing.SecretKey != p.SecretKey ||
		existing.Region != p.Region

	if credsChanged {
		if err := s.s3.TestConnection(ctx, p); err != nil {
			return nil, errors.New("cannot connect to provider with updated credentials: " + err.Error())
		}
	}

	useSSLInt := 0
	if p.UseSSL {
		useSSLInt = 1
	}

	_, err = s.db.Exec(`
		UPDATE provider_configs
		SET name = ?, kind = ?, endpoint = ?, port = ?, use_ssl = ?, access_key = ?, secret_key = ?, region = ?
		WHERE id = ?
	`, p.Name, p.Kind, p.EndPoint, p.Port, useSSLInt, p.AccessKey, p.SecretKey, p.Region, id)
	if err != nil {
		return nil, err
	}

	s.s3.Invalidate(id)
	p.ID = id
	p.CreatedAt = existing.CreatedAt
	return p, nil
}

func (s *Service) Remove(id string) error {
	res, err := s.db.Exec("DELETE FROM provider_configs WHERE id = ?", id)
	if err != nil {
		return err
	}
	affected, _ := res.RowsAffected()
	if affected == 0 {
		return errors.New("provider not found")
	}
	s.s3.Invalidate(id)
	return nil
}
