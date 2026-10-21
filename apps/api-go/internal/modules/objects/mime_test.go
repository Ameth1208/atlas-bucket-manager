package objects_test

import (
	"testing"

	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/modules/objects"
)

func TestMimeAndCategories(t *testing.T) {
	cases := []struct {
		filename string
		wantMime string
		wantCat  string
	}{
		{"image.png", "image/png", "Images"},
		{"photo.jpg", "image/jpeg", "Images"},
		{"doc.pdf", "application/pdf", "Documents"},
		{"notes.txt", "text/plain; charset=utf-8", "Documents"},
		{"video.mp4", "video/mp4", "Media"},
		{"archive.zip", "application/zip", "Archives"},
		{"script.ts", "text/plain; charset=utf-8", "Code"},
		{"unknown.xyz123", "application/octet-stream", "Other"},
	}

	for _, c := range cases {
		m := objects.GetMimeType(c.filename)
		if m != c.wantMime {
			t.Errorf("GetMimeType(%s) = %s, want %s", c.filename, m, c.wantMime)
		}

		cat := objects.GetCategory(c.filename)
		if cat != c.wantCat {
			t.Errorf("GetCategory(%s) = %s, want %s", c.filename, cat, c.wantCat)
		}
	}
}
