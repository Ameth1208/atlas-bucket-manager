package s3

import (
	"context"
	"crypto/tls"
	"fmt"
	"net"
	"net/http"
	"sync"
	"time"

	"github.com/ameth1208/atlas-bucket-manager/apps/api/internal/database"
	"github.com/ameth1208/atlas-bucket-manager/apps/api/internal/domain"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type Manager struct {
	db      *database.DB
	clients map[string]*minio.Client
	mu      sync.RWMutex
}

func NewManager(db *database.DB) *Manager {
	return &Manager{
		db:      db,
		clients: make(map[string]*minio.Client),
	}
}

func (m *Manager) buildTransport(useSSL bool) http.RoundTripper {
	return &http.Transport{
		Proxy: http.ProxyFromEnvironment,
		DialContext: (&net.Dialer{
			Timeout:   5 * time.Second,
			KeepAlive: 30 * time.Second,
		}).DialContext,
		MaxIdleConns:          100,
		IdleConnTimeout:       90 * time.Second,
		TLSHandshakeTimeout:   5 * time.Second,
		ExpectContinueTimeout: 1 * time.Second,
		TLSClientConfig: &tls.Config{
			InsecureSkipVerify: false,
		},
	}
}

func (m *Manager) GetClient(providerID string) (*minio.Client, error) {
	m.mu.RLock()
	if client, ok := m.clients[providerID]; ok {
		m.mu.RUnlock()
		return client, nil
	}
	m.mu.RUnlock()

	provider, err := m.FindProvider(providerID)
	if err != nil {
		return nil, err
	}
	if provider == nil {
		return nil, fmt.Errorf("provider not found: %s", providerID)
	}

	client, err := m.BuildClient(provider, "")
	if err != nil {
		return nil, err
	}

	m.mu.Lock()
	m.clients[providerID] = client
	m.mu.Unlock()

	return client, nil
}

func (m *Manager) Invalidate(providerID string) {
	m.mu.Lock()
	delete(m.clients, providerID)
	m.mu.Unlock()
}

func (m *Manager) BuildClient(provider *domain.Provider, regionOverride string) (*minio.Client, error) {
	endpoint := provider.EndPoint
	if (provider.UseSSL && provider.Port != 443) || (!provider.UseSSL && provider.Port != 80) {
		endpoint = fmt.Sprintf("%s:%d", provider.EndPoint, provider.Port)
	}

	region := provider.Region
	if regionOverride != "" {
		region = regionOverride
	}

	opts := &minio.Options{
		Creds:     credentials.NewStaticV4(provider.AccessKey, provider.SecretKey, ""),
		Secure:    provider.UseSSL,
		Region:    region,
		Transport: m.buildTransport(provider.UseSSL),
	}

	return minio.New(endpoint, opts)
}

func (m *Manager) FindProvider(id string) (*domain.Provider, error) {
	var p domain.Provider
	var useSSLInt int
	err := m.db.QueryRow(`
		SELECT id, name, kind, endpoint, port, use_ssl, access_key, secret_key, region, created_at
		FROM provider_configs WHERE id = ?
	`, id).Scan(
		&p.ID, &p.Name, &p.Kind, &p.EndPoint, &p.Port, &useSSLInt,
		&p.AccessKey, &p.SecretKey, &p.Region, &p.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	p.UseSSL = useSSLInt == 1
	return &p, nil
}

func (m *Manager) ListProviders() ([]domain.Provider, error) {
	rows, err := m.db.Query(`
		SELECT id, name, kind, endpoint, port, use_ssl, access_key, secret_key, region, created_at
		FROM provider_configs ORDER BY created_at ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []domain.Provider
	for rows.Next() {
		var p domain.Provider
		var useSSLInt int
		if err := rows.Scan(&p.ID, &p.Name, &p.Kind, &p.EndPoint, &p.Port, &useSSLInt,
			&p.AccessKey, &p.SecretKey, &p.Region, &p.CreatedAt); err != nil {
			return nil, err
		}
		p.UseSSL = useSSLInt == 1
		result = append(result, p)
	}
	if result == nil {
		result = []domain.Provider{}
	}
	return result, nil
}

func (m *Manager) TestConnection(ctx context.Context, p *domain.Provider) error {
	client, err := m.BuildClient(p, "")
	if err != nil {
		return err
	}

	testCtx, cancel := context.WithTimeout(ctx, 6*time.Second)
	defer cancel()

	_, err = client.ListBuckets(testCtx)
	return err
}
