package users

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/database"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/domain"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	db *database.DB
}

func NewService(db *database.DB) *Service {
	return &Service{db: db}
}

func (s *Service) List() ([]domain.User, error) {
	rows, err := s.db.Query(`
		SELECT id, name, email, role, avatar_seed, created_at
		FROM users ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []domain.User
	for rows.Next() {
		var u domain.User
		if err := rows.Scan(&u.ID, &u.Name, &u.Email, &u.Role, &u.AvatarSeed, &u.CreatedAt); err != nil {
			return nil, err
		}
		result = append(result, u)
	}
	if result == nil {
		result = []domain.User{}
	}
	return result, nil
}

func (s *Service) Create(name, email, password string, role domain.UserRole, avatarSeed *string) (*domain.User, error) {
	if role == "" {
		role = domain.RoleViewer
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	id := uuid.New().String()
	now := time.Now().Unix()

	_, err = s.db.Exec(`
		INSERT INTO users (id, name, email, password_hash, role, avatar_seed, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`, id, name, email, string(hash), role, avatarSeed, now)
	if err != nil {
		return nil, err
	}

	return &domain.User{
		ID:         id,
		Name:       name,
		Email:      email,
		Role:       role,
		AvatarSeed: avatarSeed,
		CreatedAt:  now,
	}, nil
}

func (s *Service) Update(id string, name, email *string, role *domain.UserRole, avatarSeed *string, password *string) (*domain.User, error) {
	var current domain.User
	err := s.db.QueryRow("SELECT id, name, email, role, avatar_seed, created_at FROM users WHERE id = ?", id).
		Scan(&current.ID, &current.Name, &current.Email, &current.Role, &current.AvatarSeed, &current.CreatedAt)
	if err != nil {
		return nil, err
	}

	if name != nil {
		current.Name = *name
	}
	if email != nil {
		current.Email = *email
	}
	if role != nil {
		current.Role = *role
	}
	if avatarSeed != nil {
		current.AvatarSeed = avatarSeed
	}

	_, err = s.db.Exec(`
		UPDATE users SET name = ?, email = ?, role = ?, avatar_seed = ?
		WHERE id = ?
	`, current.Name, current.Email, current.Role, current.AvatarSeed, id)
	if err != nil {
		return nil, err
	}

	if password != nil && *password != "" {
		hash, err := bcrypt.GenerateFromPassword([]byte(*password), bcrypt.DefaultCost)
		if err == nil {
			_, _ = s.db.Exec("UPDATE users SET password_hash = ? WHERE id = ?", string(hash), id)
		}
	}

	return &current, nil
}

func (s *Service) ResetPassword(id string) (string, int64, error) {
	bytes := make([]byte, 24)
	if _, err := rand.Read(bytes); err != nil {
		return "", 0, err
	}
	token := hex.EncodeToString(bytes)
	expiresAt := time.Now().Add(24 * time.Hour).Unix()

	res, err := s.db.Exec(`
		UPDATE users SET password_reset_token = ?, password_reset_expires_at = ?
		WHERE id = ?
	`, token, expiresAt, id)
	if err != nil {
		return "", 0, err
	}
	affected, _ := res.RowsAffected()
	if affected == 0 {
		return "", 0, errors.New("user not found")
	}

	resetURL := fmt.Sprintf("/reset-password?token=%s", token)
	return resetURL, expiresAt, nil
}

func (s *Service) AcceptPasswordReset(token, newPassword string) error {
	var userID string
	var expiresAt int64
	err := s.db.QueryRow(`
		SELECT id, password_reset_expires_at FROM users
		WHERE password_reset_token = ?
	`, token).Scan(&userID, &expiresAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return errors.New("invalid or expired token")
		}
		return err
	}

	if time.Now().Unix() > expiresAt {
		return errors.New("token expired")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	_, err = s.db.Exec(`
		UPDATE users SET password_hash = ?, password_reset_token = NULL, password_reset_expires_at = NULL
		WHERE id = ?
	`, string(hash), userID)
	return err
}

func (s *Service) Delete(id string) error {
	res, err := s.db.Exec("DELETE FROM users WHERE id = ?", id)
	if err != nil {
		return err
	}
	affected, _ := res.RowsAffected()
	if affected == 0 {
		return errors.New("user not found")
	}
	return nil
}

func (s *Service) DeleteSelf(userID string) error {
	var role string
	_ = s.db.QueryRow("SELECT role FROM users WHERE id = ?", userID).Scan(&role)
	if role == "owner" {
		var ownerCount int
		_ = s.db.QueryRow("SELECT COUNT(*) FROM users WHERE role = 'owner'").Scan(&ownerCount)
		if ownerCount <= 1 {
			return errors.New("cannot delete the only owner account")
		}
	}
	return s.Delete(userID)
}
