package jsondb

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
)

// --- User Playlist Management ---

// AddPlaylistToUser adds a new playlist to a user's collection.
// Returns an error if the user is not found or a playlist with the same slug already exists for the user.
func (s *JsonDB) AddPlaylistToUser(username string, pl *datatypes.PlaylistData) error {
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

	// If order is 0 (unordered), assign it max existing order + 1
	if pl.Order == 0 {
		maxOrder := 0
		for _, existing := range user.Playlists {
			if existing.Order > maxOrder {
				maxOrder = existing.Order
			}
		}
		pl.Order = maxOrder + 1
	}

	user.Playlists = append(user.Playlists, *pl) // Append a copy of the playlist
	users[username] = user                       // Update the map with the modified user struct
	return s.saveUsers(users)
}

// GetUserPlaylist finds a specific playlist for a user by its slug.
// Returns a pointer to a copy of PlaylistData if found, or an error if the user or playlist is not found.
func (s *JsonDB) GetUserPlaylist(username, slug string) (*datatypes.PlaylistData, error) {
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
func (s *JsonDB) DeleteUserPlaylist(username, slug string) error {
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
func (s *JsonDB) AddVideoToPlaylist(username, slug, videoID string) error {
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
func (s *JsonDB) RemoveVideoFromPlaylist(username, slug, videoID string) error {
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

func (s *JsonDB) SetPlaylistsOrder(username string, newOrderSlugs []string) error {
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

	// Build a map from slug to playlist for quick lookup
	playlistMap := make(map[string]datatypes.PlaylistData)
	for _, pl := range user.Playlists {
		playlistMap[pl.Slug] = pl
	}

	// Validate that all slugs in newOrderSlugs exist in user's playlists
	for _, slug := range newOrderSlugs {
		if _, ok := playlistMap[slug]; !ok {
			return fmt.Errorf("playlist %q not found for user %q", slug, username)
		}
	}

	// Rebuild the playlists slice in the new order given by newOrderSlugs
	reordered := make([]datatypes.PlaylistData, 0, len(newOrderSlugs))
	for i, slug := range newOrderSlugs {
		pl := playlistMap[slug]
		pl.Order = i + 1 // assign order starting from 1
		reordered = append(reordered, pl)
	}

	// Replace user's playlists with reordered slice
	user.Playlists = reordered
	users[username] = user

	return s.saveUsers(users)
}

// UpdatePlaylistInfo updates the title and description of a user's playlist.
// Returns an error if the user or playlist is not found.
func (s *JsonDB) UpdatePlaylistInfo(username, playlistSlug, newTitle, newDescription string) error {
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
		if user.Playlists[i].Slug == playlistSlug {
			foundPlaylistIndex = i
			break
		}
	}

	if foundPlaylistIndex == -1 {
		return fmt.Errorf("playlist with slug %q not found for user %q", playlistSlug, username)
	}

	// Update the playlist title and description
	user.Playlists[foundPlaylistIndex].Title = newTitle
	user.Playlists[foundPlaylistIndex].Description = newDescription

	// Update the user in the map
	users[username] = user

	return s.saveUsers(users)
}
