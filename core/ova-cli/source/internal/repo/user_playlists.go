package repo

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
)

// AddPlaylistToUser adds a playlist to a user's list.
func (r *RepoManager) AddPlaylistToUser(username string, pl *datatypes.PlaylistData) error {
	if !r.IsDataStorageExists() {
		return fmt.Errorf("data storage is not initialized")
	}
	return r.dataStorage.AddPlaylistToUser(username, pl)
}

// GetUserPlaylist returns a specific playlist by slug for a user.
func (r *RepoManager) GetUserPlaylist(username, slug string) (*datatypes.PlaylistData, error) {
	if !r.IsDataStorageExists() {
		return nil, fmt.Errorf("data storage is not initialized")
	}
	return r.dataStorage.GetUserPlaylist(username, slug)
}

// DeleteUserPlaylist removes a playlist from a user by its slug.
func (r *RepoManager) DeleteUserPlaylist(username, slug string) error {
	if !r.IsDataStorageExists() {
		return fmt.Errorf("data storage is not initialized")
	}
	return r.dataStorage.DeleteUserPlaylist(username, slug)
}

// AddVideoToPlaylist adds a video ID to a specific playlist.
func (r *RepoManager) AddVideoToPlaylist(username, slug, videoID string) error {
	if !r.IsDataStorageExists() {
		return fmt.Errorf("data storage is not initialized")
	}
	return r.dataStorage.AddVideoToPlaylist(username, slug, videoID)
}

// RemoveVideoFromPlaylist removes a video ID from a specific playlist.
func (r *RepoManager) RemoveVideoFromPlaylist(username, slug, videoID string) error {
	if !r.IsDataStorageExists() {
		return fmt.Errorf("data storage is not initialized")
	}
	return r.dataStorage.RemoveVideoFromPlaylist(username, slug, videoID)
}

// SetPlaylistsOrder sets the order of playlists for a user based on a list of slugs.
func (r *RepoManager) SetPlaylistsOrder(username string, newOrderSlugs []string) error {
	if !r.IsDataStorageExists() {
		return fmt.Errorf("data storage is not initialized")
	}
	return r.dataStorage.SetPlaylistsOrder(username, newOrderSlugs)
}

// UpdatePlaylistInfo updates the title and description of a playlist.
func (r *RepoManager) UpdatePlaylistInfo(username, slug, title, description string) error {
	if !r.IsDataStorageExists() {
		return fmt.Errorf("data storage is not initialized")
	}
	return r.dataStorage.UpdatePlaylistInfo(username, slug, title, description)
}
