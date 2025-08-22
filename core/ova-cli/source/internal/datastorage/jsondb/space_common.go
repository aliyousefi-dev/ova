package jsondb

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
	"path/filepath"
	"strings"
)

// CreateSpace adds a new space if a space with the same name does not already exist.
// Returns an error if a space with the provided name already exists.
func (s *JsonDB) CreateSpace(space *datatypes.SpaceData) error {
	// Load existing spaces
	spaces, err := s.loadSpaces()
	if err != nil {
		return fmt.Errorf("failed to load spaces: %w", err)
	}

	// Check if space with the same name already exists
	if _, exists := spaces[space.SpaceName]; exists {
		return fmt.Errorf("space with name %q already exists", space.SpaceName)
	}

	// Add the new space
	spaces[space.SpaceName] = *space

	// Save updated spaces
	return s.saveSpaces(spaces)
}

func (s *JsonDB) DeleteSpace(name string) error {
	// Load existing spaces
	spaces, err := s.loadSpaces()
	if err != nil {
		return fmt.Errorf("failed to load spaces: %w", err)
	}

	// Check if space with the given name exists
	if _, exists := spaces[name]; !exists {
		return fmt.Errorf("space with name %q does not exist", name)
	}

	// Delete the space
	delete(spaces, name)

	// Save updated spaces
	return s.saveSpaces(spaces)
}

func (s *JsonDB) UpdateSpace(name string, updatedSpace *datatypes.SpaceData) error {
	// Load existing spaces
	spaces, err := s.loadSpaces()
	if err != nil {
		return fmt.Errorf("failed to load spaces: %w", err)
	}

	// Check if space with the given name exists
	if _, exists := spaces[name]; !exists {
		return fmt.Errorf("space with name %q does not exist", name)
	}

	// Update the space
	spaces[name] = *updatedSpace

	// Save updated spaces
	return s.saveSpaces(spaces)
}

func (s *JsonDB) GetAllSpaces() (map[string]datatypes.SpaceData, error) {
	// Load existing spaces
	spaces, err := s.loadSpaces()
	if err != nil {
		return nil, fmt.Errorf("failed to load spaces: %w", err)
	}
	return spaces, nil
}

// GetVideosBySpace returns all videos located inside the specified folder path.
// The folderPath is expected to be a relative path with slashes normalized.
// If folderPath is empty, it returns videos in the root folder.
func (s *JsonDB) GetVideosBySpace(spacePath string) ([]datatypes.VideoData, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	videosMap, err := s.loadVideos()
	if err != nil {
		return nil, fmt.Errorf("failed to load videos: %w", err)
	}

	// Normalize folder path to slash-separated and trimmed, empty string means root
	spacePath = filepath.ToSlash(strings.Trim(spacePath, "/"))

	var results []datatypes.VideoData
	for _, video := range videosMap {
		// Normalize video's folder path
		videoFolder := filepath.ToSlash(video.OwnedSpace)
		videoFolder = strings.Trim(videoFolder, "/")
		if videoFolder == "." {
			videoFolder = ""
		}

		// Match normalized folder paths
		if videoFolder == spacePath {
			results = append(results, video)
		}
	}

	return results, nil
}

func (s *JsonDB) GetVideoCountInSpace(spacePath string) (int, error) {
	// Get all videos in the specified space
	videos, err := s.GetVideosBySpace(spacePath)
	if err != nil {
		return 0, fmt.Errorf("failed to retrieve videos for space '%s': %w", spacePath, err)
	}

	// Return the count of videos in the space
	return len(videos), nil
}

func (s *JsonDB) GetVideoIDsBySpaceInRange(spacePath string, start, end int) ([]string, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Load all videos from the database
	videosMap, err := s.loadVideos()
	if err != nil {
		return nil, fmt.Errorf("failed to load videos: %w", err)
	}

	// Normalize space path to slash-separated and trimmed
	spacePath = filepath.ToSlash(strings.Trim(spacePath, "/"))

	var videoIDs []string
	for _, video := range videosMap {
		// Normalize video's space path
		videoFolder := filepath.ToSlash(video.OwnedSpace)
		videoFolder = strings.Trim(videoFolder, "/")
		if videoFolder == "." {
			videoFolder = ""
		}

		// Match the normalized space path
		if videoFolder == spacePath {
			videoIDs = append(videoIDs, video.VideoID) // Collect video ID
		}
	}

	// Validate the range
	if start < 0 || end > len(videoIDs) || start >= end {
		return nil, fmt.Errorf("invalid range [%d, %d)", start, end)
	}

	// Return the video IDs within the specified range
	return videoIDs[start:end], nil
}
