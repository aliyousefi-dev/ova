package datatypes

import (
	"time"
)

// UserData represents a user's profile and associated data.
type UserData struct {
	Username     string         `json:"username"`
	PasswordHash string         `json:"passwordHash"`
	Roles        []string       `json:"roles"`
	CreatedAt    time.Time      `json:"createdAt"`
	LastLoginAt  time.Time      `json:"lastLoginAt,omitempty"` // omitempty for zero-valued time
	Favorites    []string       `json:"favorites"`             // Stores VideoIDs
	Playlists    []PlaylistData `json:"playlists"`             // Embedded user-specific playlists
	Watched      []string       `json:"watched"`               // Stores VideoIDs the user has watched
}

// NewUserData returns an initialized UserData struct for a new user.
func NewUserData(username string, passwordHashed string) UserData {
	return UserData{
		Username:     username,
		PasswordHash: passwordHashed,
		Roles:        []string{"user"}, // Default role for a new user, 'admin' usually assigned explicitly.
		CreatedAt:    time.Now().UTC(),
		LastLoginAt:  time.Time{},      // Zero value for LastLoginAt
		Favorites:    []string{},       // Initialize with empty slice
		Playlists:    []PlaylistData{}, // Initialize with empty slice
		Watched:      []string{},       // Initialize with empty slice
	}
}
