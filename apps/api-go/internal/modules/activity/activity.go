package activity

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/database"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/domain"
	"github.com/gin-gonic/gin"
)

type Filter struct {
	Limit    int
	Offset   int
	Action   string
	Actions  []string
	Actor    string
	Bucket   string
	Provider string
	From     *int64
	To       *int64
}

type Service struct {
	db *database.DB
}

func NewService(db *database.DB) *Service {
	return &Service{db: db}
}

func (s *Service) Log(entry *domain.ActivityEntry) error {
	if entry.CreatedAt == 0 {
		entry.CreatedAt = time.Now().Unix()
	}
	_, err := s.db.Exec(`
		INSERT INTO activity_log (user_id, actor, action, target, bucket, provider, ip, status_code, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, entry.UserID, entry.Actor, entry.Action, entry.Target, entry.Bucket, entry.Provider, entry.IP, entry.StatusCode, entry.CreatedAt)
	return err
}

func (s *Service) List(f Filter) ([]domain.ActivityEntry, error) {
	if f.Limit <= 0 || f.Limit > 200 {
		f.Limit = 50
	}

	query := `
		SELECT id, user_id, actor, action, target, bucket, provider, ip, status_code, created_at
		FROM activity_log WHERE 1=1
	`
	var args []interface{}

	if len(f.Actions) > 0 {
		placeholders := make([]string, len(f.Actions))
		for i, a := range f.Actions {
			placeholders[i] = "?"
			args = append(args, a)
		}
		query += fmt.Sprintf(" AND action IN (%s)", strings.Join(placeholders, ","))
	} else if f.Action != "" {
		query += " AND action = ?"
		args = append(args, f.Action)
	}

	if f.Actor != "" {
		query += " AND actor LIKE ?"
		args = append(args, "%"+f.Actor+"%")
	}
	if f.Bucket != "" {
		query += " AND bucket = ?"
		args = append(args, f.Bucket)
	}
	if f.Provider != "" {
		query += " AND provider = ?"
		args = append(args, f.Provider)
	}
	if f.From != nil {
		query += " AND created_at >= ?"
		args = append(args, *f.From)
	}
	if f.To != nil {
		query += " AND created_at <= ?"
		args = append(args, *f.To)
	}

	query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
	args = append(args, f.Limit, f.Offset)

	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []domain.ActivityEntry
	for rows.Next() {
		var e domain.ActivityEntry
		if err := rows.Scan(
			&e.ID, &e.UserID, &e.Actor, &e.Action, &e.Target,
			&e.Bucket, &e.Provider, &e.IP, &e.StatusCode, &e.CreatedAt,
		); err != nil {
			return nil, err
		}
		result = append(result, e)
	}
	if result == nil {
		result = []domain.ActivityEntry{}
	}
	return result, nil
}

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) List(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	var actions []string
	if actionsStr := c.Query("actions"); actionsStr != "" {
		actions = strings.Split(actionsStr, ",")
	}

	var fromPtr, toPtr *int64
	if fromStr := c.Query("from"); fromStr != "" {
		if val, err := strconv.ParseInt(fromStr, 10, 64); err == nil {
			fromPtr = &val
		}
	}
	if toStr := c.Query("to"); toStr != "" {
		if val, err := strconv.ParseInt(toStr, 10, 64); err == nil {
			toPtr = &val
		}
	}

	f := Filter{
		Limit:    limit,
		Offset:   offset,
		Action:   c.Query("action"),
		Actions:  actions,
		Actor:    c.Query("actor"),
		Bucket:   c.Query("bucket"),
		Provider: c.Query("provider"),
		From:     fromPtr,
		To:       toPtr,
	}

	entries, err := h.svc.List(f)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, entries)
}
