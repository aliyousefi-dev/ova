package localstorage

import (
	"encoding/json"
	"os"
	"ova-cli/source/internal/datatypes"
)

func (s *LocalStorage) loadUsers() (map[string]datatypes.UserData, error) {
	path := s.getUserStoragePath()

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

func (s *LocalStorage) saveUsers(users map[string]datatypes.UserData) error {
	data, err := json.MarshalIndent(users, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(s.getUserStoragePath(), data, 0644)
}

// Load all videos (assuming videos stored in a map, if you want map change metadata accordingly)
func (s *LocalStorage) loadVideos() (map[string]datatypes.VideoData, error) {
	path := s.getVideoStoragePath()
	file, err := os.Open(path)
	if err != nil {
		if os.IsNotExist(err) {
			return make(map[string]datatypes.VideoData), nil
		}
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
func (s *LocalStorage) saveVideos(videos map[string]datatypes.VideoData) error {
	data, err := json.MarshalIndent(videos, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(s.getVideoStoragePath(), data, 0644)
}
