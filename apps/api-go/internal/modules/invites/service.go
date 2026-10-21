package invites

import (
	"database/sql"
	"errors"
	"time"

	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/config"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/database"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/domain"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/modules/auth"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	db      *database.DB
	authSvc *auth.Service
	cfg     *config.Config
}

func NewService(db *database.DB, authSvc *auth.Service, cfg *config.Config) *Service {
	return &Service{db: db, authSvc: authSvc, cfg: cfg}
}

func (s *Service) Create(role domain.UserRole, email *string, createdBy string) (*domain.Invite, error) {
	if role == "" {
		role = domain.RoleViewer
	}

	id := uuid.New().String()
	token := uuid.New().String()
	now := time.Now().Unix()
	expiresAt := time.Now().Add(7 * 24 * time.Hour).Unix()

	_, err := s.db.Exec(`
		INSERT INTO invites (id, token, email, role, created_by, expires_at, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`, id, token, email, role, createdBy, expiresAt, now)
	if err != nil {
		return nil, err
	}

	return &domain.Invite{
		ID:        id,
		Token:     token,
		Email:     email,
		Role:      role,
		CreatedBy: createdBy,
		ExpiresAt: &expiresAt,
		CreatedAt: now,
	}, nil
}

func (s *Service) List() ([]domain.Invite, error) {
	rows, err := s.db.Query(`
		SELECT id, token, email, role, created_by, used_at, expires_at, created_at
		FROM invites ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []domain.Invite
	for rows.Next() {
		var inv domain.Invite
		if err := rows.Scan(&inv.ID, &inv.Token, &inv.Email, &inv.Role, &inv.CreatedBy, &inv.UsedAt, &inv.ExpiresAt, &inv.CreatedAt); err != nil {
			return nil, err
		}
		result = append(result, inv)
	}
	if result == nil {
		result = []domain.Invite{}
	}
	return result, nil
}

func (s *Service) Delete(id string) error {
	res, err := s.db.Exec("DELETE FROM invites WHERE id = ?", id)
	if err != nil {
		return err
	}
	affected, _ := res.RowsAffected()
	if affected == 0 {
		return errors.New("invite not found")
	}
	return nil
}

func (s *Service) Validate(token string) (domain.UserRole, *string, error) {
	var role domain.UserRole
	var email *string
	var usedAt *int64
	var expiresAt *int64

	err := s.db.QueryRow(`
		SELECT role, email, used_at, expires_at FROM invites WHERE token = ?
	`, token).Scan(&role, &email, &usedAt, &expiresAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", nil, errors.New("invalid invite token")
		}
		return "", nil, err
	}

	if usedAt != nil {
		return "", nil, errors.New("invite has already been used")
	}

	if expiresAt != nil && time.Now().Unix() > *expiresAt {
		return "", nil, errors.New("invite has expired")
	}

	return role, email, nil
}

func (s *Service) Accept(token, name, password, email string) (*domain.User, string, error) {
	role, inviteEmail, err := s.Validate(token)
	if err != nil {
		return nil, "", err
	}

	// If invite specified an email, verify it matches
	if inviteEmail != nil && *inviteEmail != "" && *inviteEmail != email {
		return nil, "", errors.New("email does not match invite")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", err
	}

	userID := uuid.New().String()
	now := time.Now().Unix()

	// Insert user
	_, err = s.db.Exec(`
		INSERT INTO users (id, name, email, password_hash, role, created_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`, userID, name, email, string(hash), role, now)
	if err != nil {
		return nil, "", err
	}

	// Mark invite as used
	_, _ = s.db.Exec("UPDATE invites SET used_at = ? WHERE token = ?", now, token)

	user := &domain.User{
		ID:        userID,
		Name:      name,
		Email:     email,
		Role:      role,
		CreatedAt: now,
	}

	jwtToken, err := s.authSvc.GenerateToken(user)
	if err != nil {
		return nil, "", err
	}

	return user, jwtToken, nil
}
