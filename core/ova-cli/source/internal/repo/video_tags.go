package repo

import (
	"fmt"
)

// AddTagToVideo adds a tag to a video if not already present (case-insensitive).
func (r *RepoManager) AddTagToVideo(videoID, tag string) error {
	if !r.IsDataStorageInitialized() {
		return fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.AddTagToVideo(videoID, tag)
}

// RemoveTagFromVideo removes a tag from a video (case-insensitive).
func (r *RepoManager) RemoveTagFromVideo(videoID, tag string) error {
	if !r.IsDataStorageInitialized() {
		return fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.RemoveTagFromVideo(videoID, tag)
}
