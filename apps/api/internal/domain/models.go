package domain

type UserRole string

const (
	RoleOwner  UserRole = "owner"
	RoleAdmin  UserRole = "admin"
	RoleEditor UserRole = "editor"
	RoleViewer UserRole = "viewer"
)

type User struct {
	ID           string   `json:"id"`
	Name         string   `json:"name"`
	Email        string   `json:"email"`
	PasswordHash string   `json:"-"`
	Role         UserRole `json:"role"`
	AvatarSeed   *string  `json:"avatarSeed,omitempty"`
	CreatedAt    int64    `json:"createdAt"`
}

type Provider struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Kind      string `json:"kind"`
	EndPoint  string `json:"endPoint"`
	Port      int    `json:"port"`
	UseSSL    bool   `json:"useSSL"`
	AccessKey string `json:"accessKey"`
	SecretKey string `json:"secretKey"`
	Region    string `json:"region"`
	CreatedAt int64  `json:"createdAt"`
}

type BucketConfig struct {
	ID         string `json:"id"`
	ProviderID string `json:"providerId"`
	Name       string `json:"name"`
	IsPublic   bool   `json:"isPublic"`
	MaxSize    *int64 `json:"maxSize,omitempty"`
	CreatedAt  int64  `json:"createdAt"`
}

type Bucket struct {
	Name         string  `json:"name"`
	CreationDate *string `json:"creationDate,omitempty"`
	ProviderID   string  `json:"providerId"`
	ProviderName string  `json:"providerName,omitempty"`
	IsPublic     bool    `json:"isPublic"`
	IsFavorite   bool    `json:"isFavorite"`
	Limit        *int64  `json:"limit,omitempty"`
}

type ProviderListError struct {
	ProviderID   string `json:"providerId"`
	ProviderName string `json:"providerName"`
	Error        string `json:"error"`
}

type BucketsListResult struct {
	Buckets        []Bucket            `json:"buckets"`
	ProviderErrors []ProviderListError `json:"providerErrors"`
}

type BucketStats struct {
	TotalObjects int64  `json:"totalObjects"`
	TotalSize    int64  `json:"totalSize"`
	Limit        *int64 `json:"limit,omitempty"`
	ProviderID   string `json:"providerId"`
}

type StorageObject struct {
	Key          string `json:"key"`
	Size         int64  `json:"size"`
	LastModified string `json:"lastModified,omitempty"`
	ETag         string `json:"etag,omitempty"`
	IsFolder     bool   `json:"isFolder"`
}

type FileTypeCount struct {
	Type  string `json:"type"`
	Count int    `json:"count"`
	Size  int64  `json:"size"`
}

type Invite struct {
	ID        string   `json:"id"`
	Token     string   `json:"token"`
	Email     *string  `json:"email,omitempty"`
	Role      UserRole `json:"role"`
	CreatedBy string   `json:"createdBy"`
	UsedAt    *int64   `json:"usedAt,omitempty"`
	ExpiresAt *int64   `json:"expiresAt,omitempty"`
	CreatedAt int64    `json:"createdAt"`
}

type ApiKeyInfo struct {
	ID           string  `json:"id"`
	Name         string  `json:"name"`
	Prefix       string  `json:"prefix"`
	Scopes       string  `json:"scopes"`
	UserID       string  `json:"userId"`
	BucketFilter *string `json:"bucketFilter"`
	LastUsed     *int64  `json:"lastUsed"`
	CreatedAt    int64   `json:"createdAt"`
	RevokedAt    *int64  `json:"revokedAt"`
}

type CreatedApiKey struct {
	ApiKeyInfo
	FullKey string `json:"fullKey"`
}

type ActivityEntry struct {
	ID         int64   `json:"id"`
	UserID     *string `json:"userId,omitempty"`
	Actor      string  `json:"actor"`
	Action     string  `json:"action"`
	Target     *string `json:"target,omitempty"`
	Bucket     *string `json:"bucket,omitempty"`
	Provider   *string `json:"provider,omitempty"`
	IP         *string `json:"ip,omitempty"`
	StatusCode *int    `json:"statusCode,omitempty"`
	CreatedAt  int64   `json:"createdAt"`
}

type Favorite struct {
	ProviderID string `json:"providerId"`
	BucketName string `json:"bucketName"`
}

type Webhook struct {
	ID        string   `json:"id"`
	URL       string   `json:"url"`
	Events    []string `json:"events"`
	CreatedAt int64    `json:"createdAt"`
}

type NotificationPrefs struct {
	EmailEnabled bool `json:"emailEnabled"`
	OnUpload     bool `json:"onUpload"`
	OnDelete     bool `json:"onDelete"`
}

type CopyJobError struct {
	Key     string `json:"key"`
	Message string `json:"message"`
}

type CopyJobStatus string

const (
	CopyStatusQueued    CopyJobStatus = "queued"
	CopyStatusRunning   CopyJobStatus = "running"
	CopyStatusCompleted CopyJobStatus = "completed"
	CopyStatusFailed    CopyJobStatus = "failed"
	CopyStatusCancelled CopyJobStatus = "cancelled"
)

type CopyJob struct {
	ID               string         `json:"id"`
	Actor            string         `json:"-"`
	SourceProviderID string         `json:"sourceProviderId"`
	SourceBucket     string         `json:"sourceBucket"`
	DestProviderID   string         `json:"destProviderId"`
	DestBucket       string         `json:"destBucket"`
	Prefix           *string        `json:"prefix,omitempty"`
	Overwrite        bool           `json:"overwrite"`
	Status           CopyJobStatus  `json:"status"`
	TotalObjects     int64          `json:"totalObjects"`
	CopiedObjects    int64          `json:"copiedObjects"`
	TotalBytes       int64          `json:"totalBytes"`
	CopiedBytes      int64          `json:"copiedBytes"`
	Errors           []CopyJobError `json:"errors"`
	StartedAt        int64          `json:"startedAt"`
	FinishedAt       *int64         `json:"finishedAt,omitempty"`
}

type StartCopyBody struct {
	SourceProviderID string  `json:"sourceProviderId" binding:"required"`
	SourceBucket     string  `json:"sourceBucket" binding:"required"`
	DestProviderID   string  `json:"destProviderId" binding:"required"`
	DestBucket       string  `json:"destBucket" binding:"required"`
	Prefix           *string `json:"prefix,omitempty"`
	Overwrite        bool    `json:"overwrite"`
}
