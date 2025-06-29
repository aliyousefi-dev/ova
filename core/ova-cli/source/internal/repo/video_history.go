package repo

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
)

// AddVideoToWatched adds a video ID to the watched list of a user.
func (r *RepoManager) AddVideoToWatched(username, videoID string) error {
	if !r.IsDataStorageExists() {
		return fmt.Errorf("data storage is not initialized")
	}
	return r.dataStorage.AddVideoToWatched(username, videoID)
}

// GetUserWatchedVideos returns the list of watched videos for a user.
func (r *RepoManager) GetUserWatchedVideos(username string) ([]datatypes.VideoData, error) {
	if !r.IsDataStorageExists() {
		return nil, fmt.Errorf("data storage is not initialized")
	}
	return r.dataStorage.GetUserWatchedVideos(username)
}

// ClearUserWatchedHistory clears all watched videos of a user.
func (r *RepoManager) ClearUserWatchedHistory(username string) error {
	if !r.IsDataStorageExists() {
		return fmt.Errorf("data storage is not initialized")
	}
	return r.dataStorage.ClearUserWatchedHistory(username)
}
