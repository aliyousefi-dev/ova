package storage

import (
	"encoding/json"
	"fmt"
	"os"
	"ova-cli/storage/datatypes"
	"path/filepath"
	"strings"
)

type VideoStore struct {
	storageDir string
}

func newVideoStore(storageDir string) *VideoStore {
	return &VideoStore{storageDir: storageDir}
}

func (s *VideoStore) filePath() string {
	return filepath.Join(s.storageDir, "videos.json")
}

// Load all videos (assuming videos stored in a map, if you want map change metadata accordingly)
func (s *VideoStore) LoadVideos() (map[string]datatypes.VideoData, error) {
	path := s.filePath()
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
func (s *VideoStore) SaveVideos(videos map[string]datatypes.VideoData) error {
	data, err := json.MarshalIndent(videos, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(s.filePath(), data, 0644)
}

// Add or update a video — but do NOT overwrite if video exists; return error instead
func (s *VideoStore) AddVideo(video datatypes.VideoData) error {
	videos, err := s.LoadVideos()
	if err != nil {
		return err
	}

	if _, exists := videos[video.VideoID]; exists {
		return fmt.Errorf("video with ID %q already exists", video.VideoID)
	}

	videos[video.VideoID] = video
	return s.SaveVideos(videos)
}

// Remove a video by ID
func (s *VideoStore) RemoveVideo(id string) error {
	videos, err := s.LoadVideos()
	if err != nil {
		return err
	}
	delete(videos, id)
	return s.SaveVideos(videos)
}

// Find a video by ID
func (s *VideoStore) FindVideo(id string) (*datatypes.VideoData, error) {
	videos, err := s.LoadVideos()
	if err != nil {
		return nil, err
	}
	video, found := videos[id]
	if !found {
		return nil, fmt.Errorf("video %q not found", id)
	}
	return &video, nil
}

// UpdateVideo replaces the existing video with the new one.
// Returns error if the video does not exist.
func (s *VideoStore) UpdateVideo(newVideo datatypes.VideoData) error {
	videos, err := s.LoadVideos()
	if err != nil {
		return err
	}

	if _, exists := videos[newVideo.VideoID]; !exists {
		return fmt.Errorf("video %q not found", newVideo.VideoID)
	}

	videos[newVideo.VideoID] = newVideo
	return s.SaveVideos(videos)
}

// SearchVideos returns a list of videos whose title contains the query (case-insensitive).
func (s *VideoStore) SearchVideos(query string) ([]datatypes.VideoData, error) {
	query = strings.ToLower(strings.TrimSpace(query))

	if query == "" {
		return nil, fmt.Errorf("query string is empty")
	}

	videos, err := s.LoadVideos()
	if err != nil {
		return nil, err
	}

	var results []datatypes.VideoData
	for _, video := range videos {
		if strings.Contains(strings.ToLower(video.Title), query) {
			results = append(results, video)
		}
	}

	return results, nil
}
