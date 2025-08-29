package repo

import "fmt"

// RepoInfo holds repository information: video count, user count, storage used, last updated time, and any error
type RepoInfo struct {
	VideoCount  int    `json:"video_count"`
	UserCount   int    `json:"user_count"`
	StorageUsed string `json:"storage_used"`
	CreatedAt   string `json:"created_at"`
	Host        string `json:"host"` // Fake host address
	Port        int    `json:"port"` // Fake port number
}

// GetRepoInfo returns repository information as a RepoInfo struct, including video count, user count, storage used, last updated, and server info
func (r *RepoManager) GetRepoInfo() (RepoInfo, error) {

	// Load the repository configuration
	err := r.LoadRepoConfig()
	if err != nil {
		return RepoInfo{}, fmt.Errorf("failed to load repo config: %w", err)
	}

	// Fetch the video count on disk
	count, err := r.GetTotalVideoCountOnRepository()
	if err != nil {
		return RepoInfo{}, fmt.Errorf("failed to get video count: %w", err)
	}

	users, err := r.GetAllUsers()
	if err != nil {
		return RepoInfo{}, fmt.Errorf("failed to get all users: %w", err)
	}
	userCount := len(users)

	// Calculate the repository size using GetRepoSize method
	repoSize, err := r.GetRepoSize()
	if err != nil {
		return RepoInfo{}, fmt.Errorf("failed to get repo size: %w", err)
	}

	// Format the storage size (in bytes) to a human-readable format
	storageUsed := formatSize(repoSize) // Convert the repo size to a human-readable string

	// Create a RepoInfo struct with the fetched and fake data
	repoInfo := RepoInfo{
		VideoCount:  count,
		UserCount:   userCount,
		StorageUsed: storageUsed,
		CreatedAt:   r.GetConfigs().CreatedAt.Format("2006-01-02 15:04:05"),
		Host:        r.GetConfigs().ServerHost,
		Port:        r.GetConfigs().ServerPort,
	}

	// Return the RepoInfo struct and nil for error (no error)
	return repoInfo, nil
}

// formatSize formats the size in bytes to a human-readable string (e.g., 50 MB, 1 GB)
func formatSize(size int64) string {
	const (
		_  = iota
		KB = 1 << (10 * iota)
		MB
		GB
		TB
	)

	switch {
	case size >= TB:
		return fmt.Sprintf("%.2f TB", float64(size)/TB)
	case size >= GB:
		return fmt.Sprintf("%.2f GB", float64(size)/GB)
	case size >= MB:
		return fmt.Sprintf("%.2f MB", float64(size)/MB)
	case size >= KB:
		return fmt.Sprintf("%.2f KB", float64(size)/KB)
	default:
		return fmt.Sprintf("%d B", size)
	}
}
