package boltdb

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
)

// GetUserSavedVideos retrieves full VideoData for a user's favorites.
func (b *BoltDB) GetUserSavedVideos(username string) ([]datatypes.VideoData, error) {
	users, err := b.loadUsers()
	if err != nil {
		return nil, fmt.Errorf("failed to load users: %w", err)
	}

	user, exists := users[username]
	if !exists {
		return nil, fmt.Errorf("user %q not found", username)
	}

	videos, err := b.loadVideos()
	if err != nil {
		return nil, fmt.Errorf("failed to load videos to retrieve favorites for user %q: %w", username, err)
	}

	var favorites []datatypes.VideoData
	for _, vidID := range user.Favorites {
		if video, exists := videos[vidID]; exists {
			favorites = append(favorites, video)
		} else {
			// Optional: log missing favorite video IDs
			fmt.Printf("Warning: Favorite video ID %q for user %q not found in video storage.\n", vidID, username)
		}
	}

	return favorites, nil
}

// AddVideoToSaved adds a video ID to user's favorites list.
func (b *BoltDB) AddVideoToSaved(username, videoID string) error {
	users, err := b.loadUsers()
	if err != nil {
		return fmt.Errorf("failed to load users: %w", err)
	}

	user, exists := users[username]
	if !exists {
		return fmt.Errorf("user %q not found", username)
	}

	videos, err := b.loadVideos()
	if err != nil {
		return fmt.Errorf("failed to load videos to check existence: %w", err)
	}
	if _, videoExists := videos[videoID]; !videoExists {
		return fmt.Errorf("video %q not found in video storage", videoID)
	}

	for _, favID := range user.Favorites {
		if favID == videoID {
			return fmt.Errorf("video %q is already in %q's favorites", videoID, username)
		}
	}

	user.Favorites = append(user.Favorites, videoID)
	users[username] = user
	return b.saveUsers(users)
}

// RemoveVideoFromSaved removes a video ID from user's favorites list.
func (b *BoltDB) RemoveVideoFromSaved(username, videoID string) error {
	users, err := b.loadUsers()
	if err != nil {
		return fmt.Errorf("failed to load users: %w", err)
	}

	user, exists := users[username]
	if !exists {
		return fmt.Errorf("user %q not found", username)
	}

	foundAndRemoved := false
	newFavorites := make([]string, 0, len(user.Favorites))
	for _, favID := range user.Favorites {
		if favID == videoID {
			foundAndRemoved = true
			continue
		}
		newFavorites = append(newFavorites, favID)
	}

	if !foundAndRemoved {
		return fmt.Errorf("video %q not found in %q's favorites", videoID, username)
	}

	user.Favorites = newFavorites
	users[username] = user
	return b.saveUsers(users)
}
