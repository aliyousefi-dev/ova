package repo

import (
	"fmt"
)

// AddVideoToSaved adds a video ID to the saved (favorite) list of a user.
func (r *RepoManager) AddVideoToSaved(username, videoID string) error {
	if !r.IsDataStorageInitialized() {
		return fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.AddVideoToSaved(username, videoID)
}

// GetUserSavedVideos returns the list of saved (favorite) videos for a user.
func (r *RepoManager) GetUserSavedVideos(username string) ([]string, error) {
	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.GetUserSavedVideos(username)
}

// GetUserSavedVideosInRange returns a range of saved videos for a user.
func (r *RepoManager) GetUserSavedVideosInRange(username string, start, end int) ([]string, error) {
	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("data storage is not initialized")
	}

	// Retrieve the full list of saved videoIds first
	videoIds, err := r.diskDataStorage.GetUserSavedVideos(username)
	if err != nil {
		return nil, fmt.Errorf("failed to get saved videos: %v", err)
	}

	// Validate the range values
	if start < 0 || end > len(videoIds) || start >= end {
		return nil, fmt.Errorf("invalid range")
	}

	// Return the videos in the specified range
	return videoIds[start:end], nil
}

// GetUserSavedVideosCount returns the count of saved videos for a user.
func (r *RepoManager) GetUserSavedVideosCount(username string) (int, error) {
	if !r.IsDataStorageInitialized() {
		return 0, fmt.Errorf("data storage is not initialized")
	}

	// Retrieve the full list of saved videos
	videos, err := r.diskDataStorage.GetUserSavedVideos(username)
	if err != nil {
		return 0, fmt.Errorf("failed to get saved videos: %v", err)
	}

	// Return the count of saved videos
	return len(videos), nil
}

// RemoveVideoFromSaved removes a video ID from a user's favorites list.
func (r *RepoManager) RemoveVideoFromSaved(username, videoID string) error {
	if !r.IsDataStorageInitialized() {
		return fmt.Errorf("data storage not initialized")
	}
	return r.diskDataStorage.RemoveVideoFromSaved(username, videoID)
}
