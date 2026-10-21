package objects

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"path"
	"strings"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

func getBucket(c *gin.Context) string {
	b := c.Param("name")
	if b == "" {
		b = c.Param("bucket")
	}
	return b
}

func (h *Handler) List(c *gin.Context) {
	providerID := c.Param("providerId")
	bucket := getBucket(c)
	prefix := c.Query("prefix")

	list, err := h.svc.List(c.Request.Context(), providerID, bucket, prefix)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

func (h *Handler) Search(c *gin.Context) {
	q := c.Query("q")
	bucket := c.Query("bucket")
	providerID := c.Query("providerId")

	results, err := h.svc.Search(c.Request.Context(), bucket, providerID, q)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, results)
}

func (h *Handler) FileTypes(c *gin.Context) {
	types, err := h.svc.FileTypes(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, types)
}

func (h *Handler) DispatchObject(c *gin.Context) {
	key := c.Param("key")
	if strings.HasSuffix(key, "/url") {
		h.PresignedURL(c)
		return
	}
	h.Stream(c)
}

func (h *Handler) PresignedURL(c *gin.Context) {
	providerID := c.Param("providerId")
	bucket := getBucket(c)
	key := strings.TrimPrefix(c.Param("key"), "/")

	// Strip trailing /url if captured by wildcard
	key = strings.TrimSuffix(key, "/url")

	u, err := h.svc.PresignedURL(c.Request.Context(), providerID, bucket, key)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"url": u})
}

func (h *Handler) Stream(c *gin.Context) {
	providerID := c.Param("providerId")
	bucket := getBucket(c)
	key := strings.TrimPrefix(c.Param("key"), "/")
	key = strings.TrimSuffix(key, "/stream")

	download := c.Query("download")

	obj, mime, fileName, err := h.svc.Stream(c.Request.Context(), providerID, bucket, key)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Object not found"})
		return
	}
	defer obj.Close()

	c.Header("Content-Type", mime)
	if download == "1" || download == "true" {
		c.Header("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, url.PathEscape(fileName)))
	} else {
		c.Header("Content-Disposition", fmt.Sprintf(`inline; filename="%s"`, url.PathEscape(fileName)))
	}
	c.Header("Cache-Control", "private, max-age=3600")

	_, _ = io.Copy(c.Writer, obj)
}

func (h *Handler) PublicStream(c *gin.Context) {
	providerID := c.Param("providerId")
	bucket := getBucket(c)
	key := strings.TrimPrefix(c.Param("key"), "/")
	key = strings.TrimPrefix(key, "objects/") // Handle optional /objects/ path segment

	download := c.Query("download")

	obj, mime, fileName, err := h.svc.Stream(c.Request.Context(), providerID, bucket, key)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Shared object not found"})
		return
	}
	defer obj.Close()

	c.Header("Content-Type", mime)
	if download == "1" || download == "true" {
		c.Header("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, url.PathEscape(fileName)))
	} else {
		c.Header("Content-Disposition", fmt.Sprintf(`inline; filename="%s"`, url.PathEscape(fileName)))
	}
	c.Header("Cache-Control", "public, max-age=86400")

	_, _ = io.Copy(c.Writer, obj)
}

type DeleteObjectsRequest struct {
	Keys []string `json:"keys" binding:"required"`
}

func (h *Handler) Delete(c *gin.Context) {
	providerID := c.Param("providerId")
	bucket := getBucket(c)

	var req DeleteObjectsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.svc.Delete(c.Request.Context(), providerID, bucket, req.Keys); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

type CreateFolderRequest struct {
	FolderName string `json:"folderName" binding:"required"`
	Prefix     string `json:"prefix"`
}

func (h *Handler) CreateFolder(c *gin.Context) {
	providerID := c.Param("providerId")
	bucket := getBucket(c)

	var req CreateFolderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.svc.CreateFolder(c.Request.Context(), providerID, bucket, req.FolderName, req.Prefix); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

func (h *Handler) Upload(c *gin.Context) {
	providerID := c.Param("providerId")
	bucket := getBucket(c)

	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid multipart form: " + err.Error()})
		return
	}

	files := form.File["files"]
	if len(files) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No files uploaded"})
		return
	}

	prefix := ""
	if vals := form.Value["prefix"]; len(vals) > 0 {
		prefix = strings.Trim(vals[0], "/")
		if prefix != "" {
			prefix += "/"
		}
	}

	var uploaded []string
	for _, fileHeader := range files {
		file, err := fileHeader.Open()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open file: " + err.Error()})
			return
		}

		objectName := prefix + fileHeader.Filename
		err = h.svc.Upload(c.Request.Context(), providerID, bucket, objectName, file, fileHeader.Size, fileHeader.Header.Get("Content-Type"))
		file.Close()

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		uploaded = append(uploaded, objectName)
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "uploaded": uploaded})
}

func (h *Handler) DownloadZip(c *gin.Context) {
	providerID := c.Param("providerId")
	bucket := getBucket(c)

	prefix := c.Query("prefix")
	keysParam := c.Query("keys")

	var keys []string
	if keysParam != "" {
		if strings.HasPrefix(keysParam, "[") {
			_ = json.Unmarshal([]byte(keysParam), &keys)
		} else {
			keys = strings.Split(keysParam, ",")
		}
	}

	zipName := bucket
	if prefix != "" {
		zipName = path.Base(prefix)
	}

	c.Header("Content-Type", "application/zip")
	c.Header("Content-Disposition", fmt.Sprintf(`attachment; filename="%s.zip"`, url.PathEscape(zipName)))

	if err := h.svc.StreamZip(c.Request.Context(), providerID, bucket, prefix, keys, c.Writer); err != nil {
		// If headers weren't sent, return error json
		if !c.Writer.Written() {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		}
	}
}

type ZipPostBody struct {
	Prefix string      `json:"prefix"`
	Keys   interface{} `json:"keys"`
}

func (h *Handler) DownloadZipPost(c *gin.Context) {
	providerID := c.Param("providerId")
	bucket := getBucket(c)

	var body ZipPostBody
	_ = c.ShouldBindJSON(&body)

	var keys []string
	if body.Keys != nil {
		switch v := body.Keys.(type) {
		case []interface{}:
			for _, item := range v {
				if s, ok := item.(string); ok {
					keys = append(keys, s)
				}
			}
		case string:
			if strings.HasPrefix(v, "[") {
				_ = json.Unmarshal([]byte(v), &keys)
			} else {
				keys = strings.Split(v, ",")
			}
		}
	}

	zipName := bucket
	if body.Prefix != "" {
		zipName = path.Base(body.Prefix)
	}

	c.Header("Content-Type", "application/zip")
	c.Header("Content-Disposition", fmt.Sprintf(`attachment; filename="%s.zip"`, url.PathEscape(zipName)))

	if err := h.svc.StreamZip(c.Request.Context(), providerID, bucket, body.Prefix, keys, c.Writer); err != nil {
		if !c.Writer.Written() {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		}
	}
}
