package jsondb

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
)

func (s *JsonDB) AddVideoToWatched(username, videoID string) error {
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

	// Check if video already in watched list
	for _, v := range user.Watched {
		if v == videoID {
			return nil // already watched, no need to add again
		}
	}

	// Optionally check if video exists in global video storage
	videos, err := s.loadVideos()
	if err != nil {
		return fmt.Errorf("failed to load videos: %w", err)
	}
	if _, videoExists := videos[videoID]; !videoExists {
		return fmt.Errorf("video %q not found in video storage", videoID)
	}

	// Append to watched list
	user.Watched = append(user.Watched, videoID)

	users[username] = user // update map

	return s.saveUsers(users)
}

func (s *JsonDB) GetUserWatchedVideos(username string) ([]datatypes.VideoData, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Load all users
	users, err := s.loadUsers()
	if err != nil {
		return nil, fmt.Errorf("failed to load users: %w", err)
	}

	// Find user
	user, exists := users[username]
	if !exists {
		return nil, fmt.Errorf("user %q not found", username)
	}

	// Load all videos to map videoID -> VideoData
	videos, err := s.loadVideos()
	if err != nil {
		return nil, fmt.Errorf("failed to load videos: %w", err)
	}

	// Collect watched videos data
	var watchedVideos []datatypes.VideoData
	for _, videoID := range user.Watched {
		if video, ok := videos[videoID]; ok {
			watchedVideos = append(watchedVideos, video)
		}
	}

	return watchedVideos, nil
}

// ClearUserWatchedHistory clears all watched videos for a given user.
func (s *JsonDB) ClearUserWatchedHistory(username string) error {
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

	// Clear the watched list by re-initializing it as an empty slice
	user.Watched = []string{} // Or make([]string, 0)

	users[username] = user // Update the user map with the modified user data

	return s.saveUsers(users) // Save the updated users data back to storage
}
