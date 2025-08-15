package boltdb

import (
	"fmt"
)

// AddVideoToWatched adds a videoID to the watched list for a user.
func (b *BoltDB) AddVideoToWatched(username, videoID string) error {
	// Load users and videos from BoltDB
	users, err := b.loadUsers()
	if err != nil {
		return fmt.Errorf("failed to load users: %w", err)
	}

	user, exists := users[username]
	if !exists {
		return fmt.Errorf("user %q not found", username)
	}

	// Check if video already watched
	for _, v := range user.Watched {
		if v == videoID {
			return nil // already watched, no change needed
		}
	}

	// Check if video exists
	videos, err := b.loadVideos()
	if err != nil {
		return fmt.Errorf("failed to load videos: %w", err)
	}
	if _, videoExists := videos[videoID]; !videoExists {
		return fmt.Errorf("video %q not found in video storage", videoID)
	}

	// Append video to watched list
	user.Watched = append(user.Watched, videoID)

	users[username] = user

	// Save updated users map back to DB
	return b.saveUsers(users)
}

// GetUserWatchedVideos returns VideoData for all videos watched by a user.
func (b *BoltDB) GetUserWatchedVideos(username string) ([]string, error) {
	users, err := b.loadUsers()
	if err != nil {
		return nil, fmt.Errorf("failed to load users: %w", err)
	}

	user, exists := users[username]
	if !exists {
		return nil, fmt.Errorf("user %q not found", username)
	}

	return user.Watched, nil
}

// ClearUserWatchedHistory clears the watched videos list for a user.
func (b *BoltDB) ClearUserWatchedHistory(username string) error {
	users, err := b.loadUsers()
	if err != nil {
		return fmt.Errorf("failed to load users: %w", err)
	}

	user, exists := users[username]
	if !exists {
		return fmt.Errorf("user %q not found", username)
	}

	// Clear watched list
	user.Watched = []string{}

	users[username] = user

	return b.saveUsers(users)
}
