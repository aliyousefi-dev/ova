package jsondb

import (
	"fmt"
)

// GetUserSavedVideos retrieves the full VideoData for a user's favorite videos.
// Returns an error if the user is not found or loading videos fails.
func (s *JsonDB) GetUserSavedVideos(username string) ([]string, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	users, err := s.loadUsers()
	if err != nil {
		return nil, fmt.Errorf("failed to load users: %w", err)
	}

	user, exists := users[username]
	if !exists {
		return nil, fmt.Errorf("user %q not found", username)
	}

	return user.Favorites, nil
}

// AddVideoToSaved adds a video ID to a user's favorites list.
// Returns an error if the user or video is not found, or if the video is already favorited.
func (s *JsonDB) AddVideoToSaved(username, videoID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	users, err := s.loadUsers()
	if err != nil {
		return fmt.Errorf("failed to load users: %w", err)
	}

	user, exists := users[username]
	if !exists {
		return fmt.Errorf("user %q not found", username)
	}

	// Check if video exists in main video storage before adding to favorites
	videos, err := s.loadVideos()
	if err != nil {
		return fmt.Errorf("failed to load videos to check existence: %w", err)
	}
	if _, videoExists := videos[videoID]; !videoExists {
		return fmt.Errorf("video %q not found in video storage", videoID)
	}

	// Check if video is already in favorites
	for _, favID := range user.Favorites {
		if favID == videoID { // VideoID is a hash, so exact match is appropriate.
			return fmt.Errorf("video %q is already in %q's favorites", videoID, username)
		}
	}

	user.Favorites = append(user.Favorites, videoID)
	users[username] = user // Update the map with the modified user struct
	return s.saveUsers(users)
}

// RemoveVideoFromSaved removes a video ID from a user's favorites list.
// Returns an error if the user is not found, or if the video is not in their favorites.
func (s *JsonDB) RemoveVideoFromSaved(username, videoID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	users, err := s.loadUsers()
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
			continue // Skip this video ID
		}
		newFavorites = append(newFavorites, favID)
	}

	if !foundAndRemoved {
		return fmt.Errorf("video %q not found in %q's favorites", videoID, username)
	}

	user.Favorites = newFavorites
	users[username] = user // Update the map with the modified user struct
	return s.saveUsers(users)
}
