package jsondb

import (
	"fmt" // os is not directly used in the provided functions, but good to keep if used elsewhere in the package.
	"ova-cli/source/internal/datatypes"
	"path/filepath"
	"strings"
)

// AddVideo adds a new video if it does not already exist.
// Returns an error if a video with the same ID already exists.
func (s *JsonDB) AddVideo(video datatypes.VideoData) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	videos, err := s.loadVideos()
	if err != nil {
		return fmt.Errorf("failed to load videos: %w", err)
	}

	if _, exists := videos[video.VideoID]; exists {
		return fmt.Errorf("video with ID %q already exists", video.VideoID)
	}

	videos[video.VideoID] = video
	return s.saveVideos(videos)
}

// DeleteVideo removes a video by its ID.
// If the video does not exist, it's considered a no-op (no error is returned).
func (s *JsonDB) DeleteVideoByID(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	videos, err := s.loadVideos()
	if err != nil {
		return fmt.Errorf("failed to load videos: %w", err)
	}

	// The delete operation is safe even if the key doesn't exist.
	delete(videos, id)
	return s.saveVideos(videos)
}

// GetVideoByID finds a video by its ID.
// Returns a pointer to VideoData if found, or an error if the video does not exist.
func (s *JsonDB) GetVideoByID(id string) (*datatypes.VideoData, error) {
	s.mu.Lock() // Added lock for read operation, consistency with other methods
	defer s.mu.Unlock()

	videos, err := s.loadVideos()
	if err != nil {
		return nil, fmt.Errorf("failed to load videos: %w", err)
	}

	video, found := videos[id]
	if !found {
		return nil, fmt.Errorf("video %q not found", id)
	}
	// Return a pointer to a copy of the video data from the map.
	// This prevents external modification of the map's internal data without going through the setter.
	return &video, nil
}

func (s *JsonDB) GetVideoByPath(path string) (*datatypes.VideoData, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	videos, err := s.loadVideos()
	if err != nil {
		return nil, fmt.Errorf("failed to load videos: %w", err)
	}

	for _, video := range videos {
		if video.FileName == path {
			return &video, nil
		}
	}
	return nil, fmt.Errorf("video with path %q not found", path)
}

// UpdateVideo replaces an existing video with the provided new video data.
// Returns an error if the video to be updated does not exist.
func (s *JsonDB) UpdateVideo(newVideo datatypes.VideoData) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	videos, err := s.loadVideos()
	if err != nil {
		return fmt.Errorf("failed to load videos: %w", err)
	}

	if _, exists := videos[newVideo.VideoID]; !exists {
		return fmt.Errorf("video %q not found for update", newVideo.VideoID)
	}

	videos[newVideo.VideoID] = newVideo
	return s.saveVideos(videos)
}

// GetFolderList returns a slice of unique folder paths where videos are stored.
// Paths are relative to the repository root.
func (s *JsonDB) GetFolderList() ([]string, error) {
	s.mu.Lock() // Added lock for read operation
	defer s.mu.Unlock()

	// Directly load all videos instead of using SearchVideos with empty criteria.
	allVideosMap, err := s.loadVideos()
	if err != nil {
		return nil, fmt.Errorf("failed to load all videos for folder list: %w", err)
	}

	folderSet := make(map[string]struct{})

	for _, video := range allVideosMap {
		// Ensure paths are consistently slash-separated
		relPath := filepath.ToSlash(video.FileName)
		folder := filepath.Dir(relPath)

		// Trim leading/trailing slashes and handle root directory
		folder = strings.Trim(folder, "/")
		if folder == "." { // If it's the current directory (root of the repo)
			folder = "" // Represent root as an empty string
		}
		folderSet[folder] = struct{}{}
	}

	// Convert set keys to slice
	folders := make([]string, 0, len(folderSet)+1)
	folders = append(folders, "") // Always include root folder as empty string
	for folder := range folderSet {
		if folder != "" {
			folders = append(folders, folder)
		}
	}

	return folders, nil
}

// GetAllVideos returns all videos currently in storage as a slice.
func (s *JsonDB) GetAllVideos() ([]datatypes.VideoData, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	videosMap, err := s.loadVideos()
	if err != nil {
		return nil, fmt.Errorf("failed to load videos: %w", err)
	}

	// Convert map to slice
	videos := make([]datatypes.VideoData, 0, len(videosMap))
	for _, video := range videosMap {
		videos = append(videos, video)
	}
	return videos, nil
}

// DeleteAllVideos removes all videos from storage.
func (s *JsonDB) DeleteAllVideos() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Clear all videos by resetting the map
	videos := make(map[string]datatypes.VideoData)

	return s.saveVideos(videos)
}


// UpdateVideoLocalPath updates the file path of a video by its ID.
// Returns an error if the video is not found.
func (s *JsonDB) UpdateVideoLocalPath(videoID, newPath string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	videos, err := s.loadVideos()
	if err != nil {
		return fmt.Errorf("failed to load videos: %w", err)
	}

	video, exists := videos[videoID]
	if !exists {
		return fmt.Errorf("video %q not found", videoID)
	}

	video.FileName = newPath
	videos[videoID] = video

	return s.saveVideos(videos)
}

func (s *JsonDB) GetTotalVideoCount() (int, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	videos, err := s.loadVideos()
	if err != nil {
		return 0, fmt.Errorf("failed to load videos: %w", err)
	}
	return len(videos), nil
}
