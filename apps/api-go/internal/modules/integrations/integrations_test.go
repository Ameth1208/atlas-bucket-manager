package integrations_test

import (
	"os"
	"testing"

	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/database"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/domain"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/modules/integrations"
)

func TestIntegrations(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "atlas-integrations-test-*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	db, err := database.Connect(tempDir)
	if err != nil {
		t.Fatalf("failed to connect db: %v", err)
	}
	defer db.Close()

	// Seed user
	_, _ = db.Exec("INSERT INTO users (id, name, email, password_hash, role) VALUES ('u1', 'User', 'u@test.local', 'hash', 'owner')")

	svc := integrations.NewService(db)

	// Webhook
	hook, err := svc.CreateWebhook("https://example.com/webhook", []string{"upload", "delete"}, "u1")
	if err != nil {
		t.Fatalf("failed to create webhook: %v", err)
	}

	hooks, err := svc.ListWebhooks()
	if err != nil || len(hooks) != 1 {
		t.Fatalf("expected 1 webhook, got %d", len(hooks))
	}

	err = svc.DeleteWebhook(hook.ID)
	if err != nil {
		t.Fatalf("failed to delete webhook: %v", err)
	}

	// Notifications
	prefs, err := svc.GetNotificationPrefs("u1")
	if err != nil || !prefs.EmailEnabled {
		t.Fatalf("expected default preferences with emailEnabled=true")
	}

	err = svc.UpdateNotificationPrefs("u1", &domain.NotificationPrefs{
		EmailEnabled: false,
		OnUpload:     true,
		OnDelete:     false,
	})
	if err != nil {
		t.Fatalf("failed to update notification prefs: %v", err)
	}

	updatedPrefs, _ := svc.GetNotificationPrefs("u1")
	if updatedPrefs.EmailEnabled != false || updatedPrefs.OnDelete != false {
		t.Fatalf("unexpected updated prefs: %+v", updatedPrefs)
	}
}
