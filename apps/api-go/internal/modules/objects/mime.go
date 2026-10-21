package objects

import (
	"path/filepath"
	"strings"
)

var mimeMap = map[string]string{
	// Images
	"png":  "image/png",
	"jpg":  "image/jpeg",
	"jpeg": "image/jpeg",
	"gif":  "image/gif",
	"webp": "image/webp",
	"svg":  "image/svg+xml",
	"bmp":  "image/bmp",
	"ico":  "image/x-icon",
	"avif": "image/avif",
	"tiff": "image/tiff",

	// Documents & Text
	"pdf":  "application/pdf",
	"txt":  "text/plain; charset=utf-8",
	"md":   "text/markdown; charset=utf-8",
	"html": "text/html; charset=utf-8",
	"htm":  "text/html; charset=utf-8",
	"css":  "text/css; charset=utf-8",
	"js":   "application/javascript; charset=utf-8",
	"ts":   "text/plain; charset=utf-8",
	"tsx":  "text/plain; charset=utf-8",
	"jsx":  "text/plain; charset=utf-8",
	"json": "application/json; charset=utf-8",
	"xml":  "application/xml; charset=utf-8",
	"yaml": "text/yaml; charset=utf-8",
	"yml":  "text/yaml; charset=utf-8",
	"csv":  "text/csv; charset=utf-8",

	// Media
	"mp4":  "video/mp4",
	"webm": "video/webm",
	"mov":  "video/quicktime",
	"mp3":  "audio/mpeg",
	"wav":  "audio/wav",
	"ogg":  "audio/ogg",
	"m4a":  "audio/mp4",

	// Archives
	"zip": "application/zip",
	"tar": "application/x-tar",
	"gz":  "application/gzip",
}

func GetMimeType(key string) string {
	ext := strings.ToLower(strings.TrimPrefix(filepath.Ext(key), "."))
	if m, ok := mimeMap[ext]; ok {
		return m
	}
	return "application/octet-stream"
}

func GetCategory(key string) string {
	ext := strings.ToLower(strings.TrimPrefix(filepath.Ext(key), "."))
	switch ext {
	case "png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "ico", "avif", "tiff":
		return "Images"
	case "pdf", "txt", "md", "csv", "doc", "docx", "xls", "xlsx":
		return "Documents"
	case "mp4", "webm", "mov", "mp3", "wav", "ogg", "m4a":
		return "Media"
	case "zip", "tar", "gz", "rar", "7z":
		return "Archives"
	case "js", "ts", "tsx", "jsx", "json", "xml", "yaml", "yml", "html", "htm", "css", "go", "py", "rs", "cpp", "c", "h", "java":
		return "Code"
	default:
		return "Other"
	}
}
