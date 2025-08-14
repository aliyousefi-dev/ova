package jsondb

import (
	"encoding/json"
	"os"
	"ova-cli/source/internal/datatypes"
)

func (s *JsonDB) loadUsers() (map[string]datatypes.UserData, error) {
	path := s.getUserDataFilePath()

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
	return os.WriteFile(s.getUserDataFilePath(), data, 0644)
}

// Load all videos (assuming videos stored in a map)
func (s *JsonDB) loadVideos() (map[string]datatypes.VideoData, error) {
	path := s.getVideoDataFilePath()

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
	return os.WriteFile(s.getVideoDataFilePath(), data, 0644)
}

func (s *JsonDB) loadSpaces() (map[string]datatypes.SpaceData, error) {
	path := s.getSpaceDataFilePath()

	// Ensure file exists with "{}" if missing
	if err := s.createEmptyJSONFileIfMissing(path); err != nil {
		return nil, err
	}

	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var spaces map[string]datatypes.SpaceData
	if err := json.Unmarshal(data, &spaces); err != nil {
		return nil, err
	}
	return spaces, nil
}

func (s *JsonDB) saveSpaces(spaces map[string]datatypes.SpaceData) error {
	data, err := json.MarshalIndent(spaces, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(s.getSpaceDataFilePath(), data, 0644)
}
