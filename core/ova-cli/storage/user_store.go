package storage

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sync"

	"ova-cli/storage/datatypes"
)

type UserStore struct {
	storageDir           string
	mu                   sync.Mutex
	userPlaylistUpdateMu sync.Mutex
}

func newUserStore(storageDir string) *UserStore {
	return &UserStore{storageDir: storageDir}
}

func (s *UserStore) filePath() string {
	return filepath.Join(s.storageDir, "users.json")
}

func (s *UserStore) LoadUsers() (map[string]datatypes.UserData, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	path := s.filePath()

	if _, err := os.Stat(path); os.IsNotExist(err) {
		return make(map[string]datatypes.UserData), nil
	}

	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var users map[string]datatypes.UserData
	if err := json.Unmarshal(data, &users); err != nil {
		return nil, err
	}
	return users, nil
}

func (s *UserStore) SaveUsers(users map[string]datatypes.UserData) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	data, err := json.MarshalIndent(users, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(s.filePath(), data, 0644)
}

func (s *UserStore) AddUser(user datatypes.UserData) error {
	users, err := s.LoadUsers()
	if err != nil {
		return err
	}

	if _, exists := users[user.Username]; exists {
		return errors.New("user with this ID already exists")
	}

	users[user.Username] = user
	return s.SaveUsers(users)
}

func (s *UserStore) RemoveUser(username string) error {
	users, err := s.LoadUsers()
	if err != nil {
		return err
	}

	if _, exists := users[username]; !exists {
		return errors.New("user not found")
	}

	delete(users, username)
	return s.SaveUsers(users)
}

func (s *UserStore) FindUser(username string) (*datatypes.UserData, error) {
	users, err := s.LoadUsers()
	if err != nil {
		return nil, err
	}

	user, exists := users[username]
	if !exists {
		return nil, errors.New("user not found")
	}

	return &user, nil
}

func (s *UserStore) UpdateUser(u datatypes.UserData) error {
	users, err := s.LoadUsers()
	if err != nil {
		return err
	}

	key := u.Username

	if _, exists := users[key]; !exists {
		return fmt.Errorf("user with username %q does not exist", key)
	}

	users[key] = u
	return s.SaveUsers(users)
}

// ------------------------
// Playlist Helper Methods
// ------------------------

// AddPlaylistToUser adds a playlist to a specific user
func (s *UserStore) AddPlaylistToUser(username string, pl datatypes.PlaylistData) error {
	user, err := s.FindUser(username)
	if err != nil {
		return err
	}

	for _, existing := range user.Playlists {
		if existing.Slug == pl.Slug {
			return fmt.Errorf("playlist with slug %q already exists", pl.Slug)
		}
	}

	user.Playlists = append(user.Playlists, pl)
	return s.UpdateUser(*user)
}

// GetPlaylist retrieves a single playlist by slug for a user
func (s *UserStore) GetPlaylist(username, slug string) (*datatypes.PlaylistData, error) {
	user, err := s.FindUser(username)
	if err != nil {
		return nil, err
	}

	for _, pl := range user.Playlists {
		if pl.Slug == slug {
			return &pl, nil
		}
	}
	return nil, errors.New("playlist not found")
}

// RemovePlaylist removes a playlist by slug for a user
func (s *UserStore) RemovePlaylist(username, slug string) error {
	user, err := s.FindUser(username)
	if err != nil {
		return err
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
		return errors.New("playlist not found")
	}

	user.Playlists = filtered
	return s.UpdateUser(*user)
}

// UpdateUserPlaylists replaces the playlists slice for a given user and saves it
func (s *UserStore) UpdateUserPlaylists(username string, pls []datatypes.PlaylistData) error {
	user, err := s.FindUser(username)
	if err != nil {
		return err
	}

	user.Playlists = pls
	return s.UpdateUser(*user)
}

func (s *UserStore) AddVideoToUserPlaylist(username, slug, videoId string) error {
	s.userPlaylistUpdateMu.Lock()
	defer s.userPlaylistUpdateMu.Unlock()

	users, err := s.LoadUsers()
	if err != nil {
		return err
	}

	user, exists := users[username]
	if !exists {
		return errors.New("user not found")
	}

	found := false
	for i := range user.Playlists {
		if user.Playlists[i].Slug == slug {
			for _, vid := range user.Playlists[i].VideoIDs {
				if vid == videoId {
					// video already exists, no need to add
					return nil
				}
			}
			user.Playlists[i].VideoIDs = append(user.Playlists[i].VideoIDs, videoId)
			found = true
			break
		}
	}

	if !found {
		return errors.New("playlist not found")
	}

	users[username] = user
	return s.SaveUsers(users)
}

func (s *UserStore) RemoveVideoFromUserPlaylist(username, slug, videoId string) error {
	s.userPlaylistUpdateMu.Lock()
	defer s.userPlaylistUpdateMu.Unlock()

	users, err := s.LoadUsers()
	if err != nil {
		return err
	}

	user, exists := users[username]
	if !exists {
		return errors.New("user not found")
	}

	foundPlaylist := false
	foundVideo := false
	for i := range user.Playlists {
		if user.Playlists[i].Slug == slug {
			foundPlaylist = true

			newVideos := []string{}
			for _, vid := range user.Playlists[i].VideoIDs {
				if vid == videoId {
					foundVideo = true
					continue
				}
				newVideos = append(newVideos, vid)
			}
			if !foundVideo {
				return errors.New("video not found in playlist")
			}

			user.Playlists[i].VideoIDs = newVideos
			break
		}
	}
	if !foundPlaylist {
		return errors.New("playlist not found")
	}

	users[username] = user
	return s.SaveUsers(users)
}
