package repo

import (
	"fmt"
)

// AddVideoToWatched adds a video ID to the watched list of a user.
func (r *RepoManager) AddVideoToWatched(username, videoID string) error {
	if !r.IsDataStorageInitialized() {
		return fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.AddVideoToWatched(username, videoID)
}

// GetUserWatchedVideos returns the list of watched videos for a user.
func (r *RepoManager) GetUserWatchedVideos(username string) ([]string, error) {
	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.GetUserWatchedVideos(username)
}

// GetUserWatchedVideosInRange returns a range of watched videos for a user.
func (r *RepoManager) GetUserWatchedVideosInRange(username string, start, end int) ([]string, error) {
	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("data storage is not initialized")
	}

	// Retrieve the full list of watched videoIds first
	videoIds, err := r.diskDataStorage.GetUserWatchedVideos(username)
	if err != nil {
		return nil, fmt.Errorf("failed to get watched videos: %v", err)
	}

	// Validate the range values
	if start < 0 || end > len(videoIds) || start >= end {
		return nil, fmt.Errorf("invalid range")
	}

	// Return the videos in the specified range
	return videoIds[start:end], nil
}

// GetUserWatchedVideosCount returns the count of watched videos for a user.
func (r *RepoManager) GetUserWatchedVideosCount(username string) (int, error) {
	if !r.IsDataStorageInitialized() {
		return 0, fmt.Errorf("data storage is not initialized")
	}

	// Retrieve the full list of watched videos
	videos, err := r.diskDataStorage.GetUserWatchedVideos(username)
	if err != nil {
		return 0, fmt.Errorf("failed to get watched videos: %v", err)
	}

	// Return the count of watched videos
	return len(videos), nil
}

// ClearUserWatchedHistory clears all watched videos of a user.
func (r *RepoManager) ClearUserWatchedHistory(username string) error {
	if !r.IsDataStorageInitialized() {
		return fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.ClearUserWatchedHistory(username)
}
