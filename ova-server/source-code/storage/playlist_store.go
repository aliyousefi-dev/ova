package storage

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"ova-server/source-code/storage/datamodels"
	"ova-server/source-code/utils"
)

type PlaylistStore struct {
	storageDir string
}

func newPlaylistStorage(storageDir string) *PlaylistStore {
	return &PlaylistStore{storageDir: storageDir}
}

func (s *PlaylistStore) filePath() string {
	return filepath.Join(s.storageDir, "playlists.json")
}

// Load all playlists
func (s *PlaylistStore) LoadPlaylists() (map[string]datamodels.PlaylistData, error) {
	path := s.filePath()
	file, err := os.Open(path)
	if err != nil {
		if os.IsNotExist(err) {
			return map[string]datamodels.PlaylistData{}, nil
		}
		return nil, err
	}
	defer file.Close()

	var playlists map[string]datamodels.PlaylistData
	decoder := json.NewDecoder(file)
	if err := decoder.Decode(&playlists); err != nil {
		return nil, err
	}
	return playlists, nil
}

// Save all playlists
func (s *PlaylistStore) SavePlaylists(playlists map[string]datamodels.PlaylistData) error {
	data, err := json.MarshalIndent(playlists, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(s.filePath(), data, 0644)
}

// Add or update playlist
func (s *PlaylistStore) AddPlaylist(p datamodels.PlaylistData) error {
	playlists, err := s.LoadPlaylists()
	if err != nil {
		return err
	}

	key := utils.ToSlug(p.Title)
	if _, exists := playlists[key]; exists {
		return fmt.Errorf("playlist with slug %q already exists", key)
	}

	playlists[key] = p
	return s.SavePlaylists(playlists)
}

// Remove playlist by ID
func (s *PlaylistStore) RemovePlaylist(id string) error {
	slug := utils.ToSlug(id)
	playlists, err := s.LoadPlaylists()
	if err != nil {
		return err
	}

	if _, exists := playlists[slug]; !exists {
		return fmt.Errorf("playlist with slug %q does not exist", slug)
	}

	delete(playlists, slug)
	return s.SavePlaylists(playlists)
}

// Find playlist by ID
func (s *PlaylistStore) FindPlaylistBySlug(slug string) (*datamodels.PlaylistData, error) {
	playlists, err := s.LoadPlaylists()
	if err != nil {
		return nil, err
	}
	p, found := playlists[slug]
	if !found {
		return nil, fmt.Errorf("playlist %q not found", slug)
	}
	return &p, nil
}

// Update playlist by slug
func (s *PlaylistStore) UpdatePlaylist(p datamodels.PlaylistData) error {
	playlists, err := s.LoadPlaylists()
	if err != nil {
		return err
	}

	key := utils.ToSlug(p.Title)
	if _, exists := playlists[key]; !exists {
		return fmt.Errorf("playlist with slug %q does not exist", key)
	}

	playlists[key] = p
	return s.SavePlaylists(playlists)
}
