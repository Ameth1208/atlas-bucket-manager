package activity_test

import (
	"os"
	"testing"

	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/database"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/domain"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/modules/activity"
)

func TestActivityLogging(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "atlas-activity-test-*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	db, err := database.Connect(tempDir)
	if err != nil {
		t.Fatalf("failed to connect db: %v", err)
	}
	defer db.Close()

	svc := activity.NewService(db)

	err = svc.Log(&domain.ActivityEntry{
		Actor:  "admin@atlas.local",
		Action: "bucket.create",
		Bucket: stringPtr("my-test-bucket"),
	})
	if err != nil {
		t.Fatalf("failed to log activity: %v", err)
	}

	list, err := svc.List(activity.Filter{Limit: 10})
	if err != nil || len(list) != 1 {
		t.Fatalf("expected 1 activity item, got %d", len(list))
	}
	if list[0].Action != "bucket.create" {
		t.Fatalf("unexpected action: %s", list[0].Action)
	}
}

func stringPtr(s string) *string {
	return &s
}
