package users_test

import (
	"os"
	"testing"

	"github.com/ameth1208/atlas-bucket-manager/apps/api/internal/database"
	"github.com/ameth1208/atlas-bucket-manager/apps/api/internal/domain"
	"github.com/ameth1208/atlas-bucket-manager/apps/api/internal/modules/users"
)

func TestUsersCRUD(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "atlas-users-test-*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	db, err := database.Connect(tempDir)
	if err != nil {
		t.Fatalf("failed to connect db: %v", err)
	}
	defer db.Close()

	svc := users.NewService(db)

	// Create user
	u, err := svc.Create("John Doe", "john@example.com", "Password123!", domain.RoleEditor, nil)
	if err != nil {
		t.Fatalf("failed to create user: %v", err)
	}
	if u.Name != "John Doe" || u.Role != domain.RoleEditor {
		t.Fatalf("unexpected user: %+v", u)
	}

	// List users
	list, err := svc.List()
	if err != nil || len(list) != 1 {
		t.Fatalf("expected 1 user, got %d, err: %v", len(list), err)
	}

	// Update user
	newName := "Johnathan Doe"
	updated, err := svc.Update(u.ID, &newName, nil, nil, nil, nil)
	if err != nil || updated.Name != newName {
		t.Fatalf("failed to update user: %v", err)
	}

	// Reset password flow
	resetURL, expiresAt, err := svc.ResetPassword(u.ID)
	if err != nil || resetURL == "" || expiresAt == 0 {
		t.Fatalf("failed to create reset password token: %v", err)
	}

	// Extract token from resetURL "/reset-password?token=..."
	token := resetURL[len("/reset-password?token="):]
	err = svc.AcceptPasswordReset(token, "BrandNewPassword123!")
	if err != nil {
		t.Fatalf("failed to accept password reset: %v", err)
	}

	// Delete user
	err = svc.Delete(u.ID)
	if err != nil {
		t.Fatalf("failed to delete user: %v", err)
	}

	listAfter, _ := svc.List()
	if len(listAfter) != 0 {
		t.Fatalf("expected 0 users after delete, got %d", len(listAfter))
	}
}
