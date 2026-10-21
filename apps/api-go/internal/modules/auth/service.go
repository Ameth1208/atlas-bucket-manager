package auth

import (
	"database/sql"
	"errors"
	"time"

	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/config"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/database"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/domain"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/middleware"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	db  *database.DB
	cfg *config.Config
}

func NewService(db *database.DB, cfg *config.Config) *Service {
	return &Service{db: db, cfg: cfg}
}

func (s *Service) IsSetupComplete() (bool, error) {
	var count int
	err := s.db.QueryRow("SELECT COUNT(*) FROM users").Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (s *Service) Setup(name, email, password string) (*domain.User, string, error) {
	complete, err := s.IsSetupComplete()
	if err != nil {
		return nil, "", err
	}
	if complete {
		return nil, "", errors.New("already set up")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", err
	}

	userID := uuid.New().String()
	now := time.Now().Unix()

	_, err = s.db.Exec(`
		INSERT INTO users (id, name, email, password_hash, role, created_at)
		VALUES (?, ?, ?, ?, 'owner', ?)
	`, userID, name, email, string(hash), now)
	if err != nil {
		return nil, "", err
	}

	user := &domain.User{
		ID:        userID,
		Name:      name,
		Email:     email,
		Role:      domain.RoleOwner,
		CreatedAt: now,
	}

	token, err := s.GenerateToken(user)
	if err != nil {
		return nil, "", err
	}

	return user, token, nil
}

func (s *Service) Login(email, password string) (*domain.User, string, error) {
	var user domain.User
	var passwordHash string
	err := s.db.QueryRow(`
		SELECT id, name, email, password_hash, role, avatar_seed, created_at
		FROM users WHERE email = ?
	`, email).Scan(
		&user.ID, &user.Name, &user.Email, &passwordHash, &user.Role, &user.AvatarSeed, &user.CreatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, "", errors.New("invalid credentials")
		}
		return nil, "", err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(password)); err != nil {
		return nil, "", errors.New("invalid credentials")
	}

	token, err := s.GenerateToken(&user)
	if err != nil {
		return nil, "", err
	}

	return &user, token, nil
}

func (s *Service) Me(userID string) (*domain.User, error) {
	var user domain.User
	err := s.db.QueryRow(`
		SELECT id, name, email, role, avatar_seed, created_at
		FROM users WHERE id = ?
	`, userID).Scan(
		&user.ID, &user.Name, &user.Email, &user.Role, &user.AvatarSeed, &user.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *Service) ChangePassword(userID, currentPassword, newPassword string) error {
	var hash string
	err := s.db.QueryRow("SELECT password_hash FROM users WHERE id = ?", userID).Scan(&hash)
	if err != nil {
		return errors.New("invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(currentPassword)); err != nil {
		return errors.New("current password is incorrect")
	}

	newHash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	_, err = s.db.Exec("UPDATE users SET password_hash = ? WHERE id = ?", string(newHash), userID)
	return err
}

func (s *Service) GenerateToken(user *domain.User) (string, error) {
	claims := middleware.Claims{
		UserID: user.ID,
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.cfg.JWTSecret))
}
