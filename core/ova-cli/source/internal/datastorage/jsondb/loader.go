package jsondb

import (
	"encoding/json"
	"os"
	"ova-cli/source/internal/datatypes"
	"path/filepath"
)

func (s *JsonDB) createEmptyJSONFileIfMissing(filePath string) error {
	_, err := os.Stat(filePath)
	if os.IsNotExist(err) {
		// Ensure the parent directory exists
		dir := filepath.Dir(filePath)
		if err := os.MkdirAll(dir, 0755); err != nil {
			return err
		}

		f, err := os.Create(filePath)
		if err != nil {
			return err
		}
		defer f.Close()

		// Write empty JSON object
		_, err = f.Write([]byte("{}"))
		if err != nil {
			return err
		}
	} else if err != nil {
		return err
	}
	return nil
}

func (s *JsonDB) loadUsers() (map[string]datatypes.UserData, error) {
	path := s.getUserStoragePath()

	// Ensure file exists with "{}" if missing
	if err := s.createEmptyJSONFileIfMissing(path); err != nil {
		return nil, err
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

func (s *JsonDB) saveUsers(users map[string]datatypes.UserData) error {
	data, err := json.MarshalIndent(users, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(s.getUserStoragePath(), data, 0644)
}

// Load all videos (assuming videos stored in a map)
func (s *JsonDB) loadVideos() (map[string]datatypes.VideoData, error) {
	path := s.getVideoStoragePath()

	// Ensure file exists with "{}" if missing
	if err := s.createEmptyJSONFileIfMissing(path); err != nil {
		return nil, err
	}

	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	var videos map[string]datatypes.VideoData
	decoder := json.NewDecoder(file)
	if err := decoder.Decode(&videos); err != nil {
		return nil, err
	}
	return videos, nil
}

// Save all videos
func (s *JsonDB) saveVideos(videos map[string]datatypes.VideoData) error {
	data, err := json.MarshalIndent(videos, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(s.getVideoStoragePath(), data, 0644)
}
