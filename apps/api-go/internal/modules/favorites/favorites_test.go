package favorites_test

import (
	"os"
	"testing"

	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/database"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/modules/favorites"
)

func TestFavorites(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "atlas-favorites-test-*")
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

	svc := favorites.NewService(db)

	err = svc.Add("u1", "provider-1", "photos")
	if err != nil {
		t.Fatalf("failed to add favorite: %v", err)
	}

	list, err := svc.List("u1")
	if err != nil || len(list) != 1 {
		t.Fatalf("expected 1 favorite, got %d", len(list))
	}

	err = svc.Remove("u1", "provider-1", "photos")
	if err != nil {
		t.Fatalf("failed to remove favorite: %v", err)
	}

	listAfter, _ := svc.List("u1")
	if len(listAfter) != 0 {
		t.Fatalf("expected 0 favorites after removal, got %d", len(listAfter))
	}
}
