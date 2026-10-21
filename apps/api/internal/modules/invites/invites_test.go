package invites_test

import (
	"os"
	"testing"

	"github.com/ameth1208/atlas-bucket-manager/apps/api/internal/config"
	"github.com/ameth1208/atlas-bucket-manager/apps/api/internal/database"
	"github.com/ameth1208/atlas-bucket-manager/apps/api/internal/domain"
	"github.com/ameth1208/atlas-bucket-manager/apps/api/internal/modules/auth"
	"github.com/ameth1208/atlas-bucket-manager/apps/api/internal/modules/invites"
)

func TestInvitesFlow(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "atlas-invites-test-*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	db, err := database.Connect(tempDir)
	if err != nil {
		t.Fatalf("failed to connect db: %v", err)
	}
	defer db.Close()

	cfg := &config.Config{JWTSecret: "test-secret-1234"}
	authSvc := auth.NewService(db, cfg)
	svc := invites.NewService(db, authSvc, cfg)

	email := "invited@example.com"
	inv, err := svc.Create(domain.RoleAdmin, &email, "admin-user-id")
	if err != nil {
		t.Fatalf("failed to create invite: %v", err)
	}

	// Validate invite
	role, validatedEmail, err := svc.Validate(inv.Token)
	if err != nil || role != domain.RoleAdmin || validatedEmail == nil || *validatedEmail != email {
		t.Fatalf("failed to validate invite: role=%s, email=%v, err=%v", role, validatedEmail, err)
	}

	// Accept invite
	user, token, err := svc.Accept(inv.Token, "Invited Person", "SecurePassword99!", email)
	if err != nil || user == nil || token == "" {
		t.Fatalf("failed to accept invite: %v", err)
	}
	if user.Email != email || user.Role != domain.RoleAdmin {
		t.Fatalf("unexpected user from invite: %+v", user)
	}

	// Re-validating used invite must fail
	_, _, err = svc.Validate(inv.Token)
	if err == nil {
		t.Fatalf("expected used invite validation to fail")
	}
}
