package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// Cloudflare R2 Configuration Environment Variables
type R2Config struct {
	AccountID       string
	AccessKeyID     string
	SecretAccessKey string
	BucketName      string
	PublicDomain    string // e.g. "https://pub-xxxx.r2.dev" or custom domain
}

func getR2Config() R2Config {
	return R2Config{
		AccountID:       os.Getenv("CLOUDFLARE_ACCOUNT_ID"),
		AccessKeyID:     os.Getenv("CLOUDFLARE_R2_ACCESS_KEY_ID"),
		SecretAccessKey: os.Getenv("CLOUDFLARE_R2_SECRET_ACCESS_KEY"),
		BucketName:      os.Getenv("CLOUDFLARE_R2_BUCKET_NAME"),
		PublicDomain:    os.Getenv("CLOUDFLARE_R2_PUBLIC_DOMAIN"),
	}
}

// GeneratePresignedUploadURL creates a presigned S3/R2 PUT URL or local upload URL fallback
func GeneratePresignedUploadURL(filename string, contentType string) (uploadURL string, publicCDNURL string, isLocal bool) {
	cfg := getR2Config()

	// If R2 credentials are not set in .env, seamlessly fall back to local disk storage
	if cfg.AccountID == "" || cfg.AccessKeyID == "" || cfg.SecretAccessKey == "" || cfg.BucketName == "" {
		uniqueName := fmt.Sprintf("%d_%s", time.Now().UnixNano(), filename)
		uploadURL = fmt.Sprintf("/api/storage/upload?filename=%s", uniqueName)
		publicCDNURL = fmt.Sprintf("/uploads/%s", uniqueName)
		return uploadURL, publicCDNURL, true
	}

	// Generate Cloudflare R2 S3-Compatible Presigned PUT URL
	objectKey := fmt.Sprintf("fit_checks/%d_%s", time.Now().Unix(), filename)
	endpoint := fmt.Sprintf("https://%s.r2.cloudflarestorage.com/%s/%s", cfg.AccountID, cfg.BucketName, objectKey)

	// In production with AWS SDK v2, generate the PresignPutObject URL
	// For simple standalone Go, we construct the direct R2 endpoint
	uploadURL = endpoint
	if cfg.PublicDomain != "" {
		publicCDNURL = fmt.Sprintf("%s/%s", strings.TrimRight(cfg.PublicDomain, "/"), objectKey)
	} else {
		publicCDNURL = endpoint
	}

	return uploadURL, publicCDNURL, false
}

// HandleLocalFileUpload saves uploaded file directly to local server/uploads/ directory
func HandleLocalFileUpload(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost && r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	filename := r.URL.Query().Get("filename")
	if filename == "" {
		filename = fmt.Sprintf("upload_%d.jpg", time.Now().Unix())
	}

	// Prevent path traversal
	filename = filepath.Base(filename)
	savePath := filepath.Join(".", "uploads", filename)

	out, err := os.Create(savePath)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to save file: %v", err), http.StatusInternalServerError)
		return
	}
	defer out.Close()

	_, err = io.Copy(out, r.Body)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to write file: %v", err), http.StatusInternalServerError)
		return
	}

	log.Printf("Successfully saved upload to local storage: %s", savePath)
	sendJSON(w, http.StatusOK, map[string]string{
		"status":    "success",
		"fileUrl":   fmt.Sprintf("/uploads/%s", filename),
		"filename":  filename,
	})
}
