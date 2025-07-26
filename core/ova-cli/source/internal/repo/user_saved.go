package repo

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
)

// GetUserSavedVideos returns the full VideoData list for a user's favorite videos.
func (r *RepoManager) GetUserSavedVideos(username string) ([]datatypes.VideoData, error) {
	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("data storage not initialized")
	}
	return r.diskDataStorage.GetUserSavedVideos(username)
}

// AddVideoToSaved adds a video ID to a user's favorites list.
func (r *RepoManager) AddVideoToSaved(username, videoID string) error {
	if !r.IsDataStorageInitialized() {
		return fmt.Errorf("data storage not initialized")
	}
	return r.diskDataStorage.AddVideoToSaved(username, videoID)
}

// RemoveVideoFromSaved removes a video ID from a user's favorites list.
func (r *RepoManager) RemoveVideoFromSaved(username, videoID string) error {
	if !r.IsDataStorageInitialized() {
		return fmt.Errorf("data storage not initialized")
	}
	return r.diskDataStorage.RemoveVideoFromSaved(username, videoID)
}
