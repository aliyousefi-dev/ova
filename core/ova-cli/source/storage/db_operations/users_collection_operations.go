package dboperations

import (
	"ova-cli/source/datatypes"
)

// UserRepository defines methods for user data operations without context
type UserRepository interface {
	// Create a new user
	CreateUser(user *datatypes.UserData) error

	// Delete an existing user by username
	DeleteUser(username string) error

	// Get a user by username
	GetUserByUsername(username string) (*datatypes.UserData, error)

	// Add a playlist to a user
	AddPlaylistToUser(username string, playlist *datatypes.PlaylistData) error

	// Get a specific playlist of a user by playlist slug/id
	GetUserPlaylist(username, playlistSlug string) (*datatypes.PlaylistData, error)

	// Delete a playlist of a user by playlist slug/id
	DeleteUserPlaylist(username, playlistSlug string) error

	// Add a video ID to a user's playlist
	AddVideoToPlaylist(username, playlistSlug, videoID string) error

	// Remove a video ID from a user's playlist
	RemoveVideoFromPlaylist(username, playlistSlug, videoID string) error
}
