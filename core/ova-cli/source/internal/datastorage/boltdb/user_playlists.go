package boltdb

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
)

// AddPlaylistToUser adds a new playlist to a user's collection.
// Returns an error if the user is not found or a playlist with the same slug already exists for the user.
func (b *BoltDB) AddPlaylistToUser(username string, pl *datatypes.PlaylistData) error {
	users, err := b.loadUsers()
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

	if pl.Order == 0 {
		maxOrder := 0
		for _, existing := range user.Playlists {
			if existing.Order > maxOrder {
				maxOrder = existing.Order
			}
		}
		pl.Order = maxOrder + 1
	}

	user.Playlists = append(user.Playlists, *pl)
	users[username] = user

	return b.saveUsers(users)
}

// GetUserPlaylist finds a playlist for a user by slug.
func (b *BoltDB) GetUserPlaylist(username, slug string) (*datatypes.PlaylistData, error) {
	users, err := b.loadUsers()
	if err != nil {
		return nil, fmt.Errorf("failed to load users: %w", err)
	}

	user, exists := users[username]
	if !exists {
		return nil, fmt.Errorf("user %q not found", username)
	}

	for _, pl := range user.Playlists {
		if pl.Slug == slug {
			return &pl, nil
		}
	}
	return nil, fmt.Errorf("playlist with slug %q not found for user %q", slug, username)
}

// DeleteUserPlaylist removes a playlist from a user's collection by slug.
func (b *BoltDB) DeleteUserPlaylist(username, slug string) error {
	users, err := b.loadUsers()
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
	users[username] = user
	return b.saveUsers(users)
}

// AddVideoToPlaylist adds a videoID to a specific playlist of a user.
func (b *BoltDB) AddVideoToPlaylist(username, slug, videoID string) error {
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

	for _, vid := range user.Playlists[foundPlaylistIndex].VideoIDs {
		if vid == videoID {
			return nil
		}
	}

	user.Playlists[foundPlaylistIndex].VideoIDs = append(user.Playlists[foundPlaylistIndex].VideoIDs, videoID)
	users[username] = user
	return b.saveUsers(users)
}

// RemoveVideoFromPlaylist removes a videoID from a specific playlist of a user.
func (b *BoltDB) RemoveVideoFromPlaylist(username, slug, videoID string) error {
	users, err := b.loadUsers()
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
			continue
		}
		newVideos = append(newVideos, vid)
	}

	if !foundVideo {
		return fmt.Errorf("video %q not found in playlist %q for user %q", videoID, slug, username)
	}

	user.Playlists[foundPlaylistIndex].VideoIDs = newVideos
	users[username] = user
	return b.saveUsers(users)
}

// SetPlaylistsOrder sets the order of playlists for a user based on a list of playlist slugs.
func (b *BoltDB) SetPlaylistsOrder(username string, newOrderSlugs []string) error {
	users, err := b.loadUsers()
	if err != nil {
		return fmt.Errorf("failed to load users: %w", err)
	}

	user, exists := users[username]
	if !exists {
		return fmt.Errorf("user %q not found", username)
	}

	playlistMap := make(map[string]datatypes.PlaylistData)
	for _, pl := range user.Playlists {
		playlistMap[pl.Slug] = pl
	}

	for _, slug := range newOrderSlugs {
		if _, ok := playlistMap[slug]; !ok {
			return fmt.Errorf("playlist %q not found for user %q", slug, username)
		}
	}

	reordered := make([]datatypes.PlaylistData, 0, len(newOrderSlugs))
	for i, slug := range newOrderSlugs {
		pl := playlistMap[slug]
		pl.Order = i + 1
		reordered = append(reordered, pl)
	}

	user.Playlists = reordered
	users[username] = user

	return b.saveUsers(users)
}

// UpdatePlaylistInfo updates the title and description of a user's playlist.
func (b *BoltDB) UpdatePlaylistInfo(username, playlistSlug, newTitle, newDescription string) error {
	users, err := b.loadUsers()
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

	user.Playlists[foundPlaylistIndex].Title = newTitle
	user.Playlists[foundPlaylistIndex].Description = newDescription

	users[username] = user
	return b.saveUsers(users)
}
