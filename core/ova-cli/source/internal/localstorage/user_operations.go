package localstorage

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
)

// --- User Management ---

// CreateUser adds a new user if a user with the same username does not already exist.
// Returns an error if a user with the provided username already exists.
func (s *LocalStorage) CreateUser(user *datatypes.UserData) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	users, err := s.loadUsers()
	if err != nil {
		return fmt.Errorf("failed to load users: %w", err)
	}

	if _, exists := users[user.Username]; exists {
		return fmt.Errorf("user with username %q already exists", user.Username)
	}

	users[user.Username] = *user // Store a copy of the UserData
	return s.saveUsers(users)
}

// DeleteUser removes a user by their username.
// Returns an error if the user is not found.
func (s *LocalStorage) DeleteUser(username string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	users, err := s.loadUsers()
	if err != nil {
		return fmt.Errorf("failed to load users: %w", err)
	}

	if _, exists := users[username]; !exists {
		return fmt.Errorf("user %q not found", username)
	}

	delete(users, username)
	return s.saveUsers(users)
}

// UpdateUser replaces an existing user's data with the provided new user data.
// Returns an error if the user does not exist.
func (s *LocalStorage) UpdateUser(updatedUser datatypes.UserData) error { // Takes value, not pointer
	s.mu.Lock()
	defer s.mu.Unlock()

	users, err := s.loadUsers()
	if err != nil {
		return fmt.Errorf("failed to load users: %w", err)
	}

	if _, exists := users[updatedUser.Username]; !exists {
		return fmt.Errorf("user %q not found for update", updatedUser.Username)
	}

	users[updatedUser.Username] = updatedUser // Store the updated value
	return s.saveUsers(users)
}

// GetUserByUsername finds a user by their username.
// Returns a pointer to a copy of UserData if found, or an error if the user does not exist.
func (s *LocalStorage) GetUserByUsername(username string) (*datatypes.UserData, error) {
	s.mu.Lock() // Ensure concurrent reads are safe
	defer s.mu.Unlock()

	users, err := s.loadUsers()
	if err != nil {
		return nil, fmt.Errorf("failed to load users: %w", err)
	}

	user, exists := users[username]
	if !exists {
		return nil, fmt.Errorf("user %q not found", username)
	}
	// Return a pointer to a copy to prevent external modification of the map's stored value
	return &user, nil
}

// GetAllUsers returns all users currently in storage as a slice.
func (s *LocalStorage) GetAllUsers() ([]datatypes.UserData, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	usersMap, err := s.loadUsers()
	if err != nil {
		return nil, fmt.Errorf("failed to load users: %w", err)
	}

	var users []datatypes.UserData
	for _, user := range usersMap {
		users = append(users, user)
	}
	return users, nil
}

// --- User Favorites Management ---

// GetUserFavoriteVideos retrieves the full VideoData for a user's favorite videos.
// Returns an error if the user is not found or loading videos fails.
func (s *LocalStorage) GetUserFavoriteVideos(username string) ([]datatypes.VideoData, error) {
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

	videos, err := s.loadVideos() // Assuming loadVideos is also under the same mutex
	if err != nil {
		return nil, fmt.Errorf("failed to load videos to retrieve favorites for user %q: %w", username, err)
	}

	var favorites []datatypes.VideoData
	for _, vidID := range user.Favorites {
		if video, exists := videos[vidID]; exists {
			favorites = append(favorites, video)
		} else {
			// Optionally log that a favorite video ID was not found, but don't fail the entire list.
			fmt.Printf("Warning: Favorite video ID %q for user %q not found in video storage.\n", vidID, username)
		}
	}

	return favorites, nil
}

// AddVideoToFavorites adds a video ID to a user's favorites list.
// Returns an error if the user or video is not found, or if the video is already favorited.
func (s *LocalStorage) AddVideoToFavorites(username, videoID string) error {
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

// RemoveVideoFromFavorites removes a video ID from a user's favorites list.
// Returns an error if the user is not found, or if the video is not in their favorites.
func (s *LocalStorage) RemoveVideoFromFavorites(username, videoID string) error {
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

// --- User Playlist Management ---

// AddPlaylistToUser adds a new playlist to a user's collection.
// Returns an error if the user is not found or a playlist with the same slug already exists for the user.
func (s *LocalStorage) AddPlaylistToUser(username string, pl *datatypes.PlaylistData) error {
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

	for _, existing := range user.Playlists {
		if existing.Slug == pl.Slug {
			return fmt.Errorf("playlist with slug %q already exists for user %q", pl.Slug, username)
		}
	}

	user.Playlists = append(user.Playlists, *pl) // Append a copy of the playlist
	users[username] = user                       // Update the map with the modified user struct
	return s.saveUsers(users)
}

// GetUserPlaylist finds a specific playlist for a user by its slug.
// Returns a pointer to a copy of PlaylistData if found, or an error if the user or playlist is not found.
func (s *LocalStorage) GetUserPlaylist(username, slug string) (*datatypes.PlaylistData, error) {
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

	for _, pl := range user.Playlists {
		if pl.Slug == slug {
			return &pl, nil // Return a pointer to a copy
		}
	}
	return nil, fmt.Errorf("playlist with slug %q not found for user %q", slug, username)
}

// DeleteUserPlaylist removes a playlist from a user's collection by its slug.
// Returns an error if the user or playlist is not found.
func (s *LocalStorage) DeleteUserPlaylist(username, slug string) error {
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

	found := false
	filtered := make([]datatypes.PlaylistData, 0, len(user.Playlists))
	for _, pl := range user.Playlists {
		if pl.Slug == slug {
			found = true
		} else {
			filtered = append(filtered, pl)
		}
	}

	if !found {
		return fmt.Errorf("playlist with slug %q not found for user %q", slug, username)
	}

	user.Playlists = filtered
	users[username] = user // Update the map with the modified user struct
	return s.saveUsers(users)
}

// AddVideoToPlaylist adds a video ID to a specific playlist of a user.
// Returns an error if the user, playlist, or video (in global storage) is not found.
// Returns nil if the video is already in the playlist.
func (s *LocalStorage) AddVideoToPlaylist(username, slug, videoID string) error {
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

	// Check if video exists in main video storage before adding to playlist
	videos, err := s.loadVideos()
	if err != nil {
		return fmt.Errorf("failed to load videos to check existence: %w", err)
	}
	if _, videoExists := videos[videoID]; !videoExists {
		return fmt.Errorf("video %q not found in video storage", videoID)
	}

	foundPlaylistIndex := -1
	for i := range user.Playlists {
		if user.Playlists[i].Slug == slug {
			foundPlaylistIndex = i
			break
		}
	}

	if foundPlaylistIndex == -1 {
		return fmt.Errorf("playlist with slug %q not found for user %q", slug, username)
	}

	// Check if video already exists in the playlist
	for _, vid := range user.Playlists[foundPlaylistIndex].VideoIDs {
		if vid == videoID {
			return nil // Video already exists in playlist, no need to add
		}
	}

	user.Playlists[foundPlaylistIndex].VideoIDs = append(user.Playlists[foundPlaylistIndex].VideoIDs, videoID)
	users[username] = user // Update the map with the modified user struct
	return s.saveUsers(users)
}

// RemoveVideoFromPlaylist removes a video ID from a specific playlist of a user.
// Returns an error if the user, playlist, or video (within the playlist) is not found.
func (s *LocalStorage) RemoveVideoFromPlaylist(username, slug, videoID string) error {
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

	foundPlaylistIndex := -1
	for i := range user.Playlists {
		if user.Playlists[i].Slug == slug {
			foundPlaylistIndex = i
			break
		}
	}

	if foundPlaylistIndex == -1 {
		return fmt.Errorf("playlist with slug %q not found for user %q", slug, username)
	}

	foundVideo := false
	newVideos := make([]string, 0, len(user.Playlists[foundPlaylistIndex].VideoIDs))
	for _, vid := range user.Playlists[foundPlaylistIndex].VideoIDs {
		if vid == videoID {
			foundVideo = true
			continue // Skip this video ID
		}
		newVideos = append(newVideos, vid)
	}

	if !foundVideo {
		return fmt.Errorf("video %q not found in playlist %q for user %q", videoID, slug, username)
	}

	user.Playlists[foundPlaylistIndex].VideoIDs = newVideos
	users[username] = user // Update the map with the modified user struct
	return s.saveUsers(users)
}
