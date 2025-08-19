package repo

import (
	"fmt"
)

// AddVideoToPlaylist adds a video ID to a specific playlist.
func (r *RepoManager) AddVideoToPlaylist(username, slug, videoID string) error {
	if !r.IsDataStorageInitialized() {
		return fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.AddVideoToPlaylist(username, slug, videoID)
}

// RemoveVideoFromPlaylist removes a video ID from a specific playlist.
func (r *RepoManager) RemoveVideoFromPlaylist(username, slug, videoID string) error {
	if !r.IsDataStorageInitialized() {
		return fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.RemoveVideoFromPlaylist(username, slug, videoID)
}

func (r *RepoManager) GetUserPlaylistContentVideosInRange(username, playlistSlug string, start, end int) ([]string, error) {
	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.GetUserPlaylistContentVideosInRange(username, playlistSlug, start, end)
}

func (r *RepoManager) GetUserPlaylistContentVideosCount(username, playlistSlug string) (int, error) {
	if !r.IsDataStorageInitialized() {
		return 0, fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.GetUserPlaylistContentVideosCount(username, playlistSlug)
}
