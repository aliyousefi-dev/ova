package repository

import (
	"ova-cli/source/internal/datatypes"
	"path/filepath"
	"strings"
)

// GetUnindexedVideos returns paths of video files on disk under root that are NOT present in indexedVideos.
func GetUnindexedVideos(root string, indexedVideos []datatypes.VideoData) ([]string, error) {
	// Step 1: Get all video paths on disk
	allVideoPaths, err := GetAllVideoPaths(root)
	if err != nil {
		return nil, err
	}

	// Step 2: Build a map (set) of indexed video paths for quick lookup
	indexedPaths := make(map[string]struct{}, len(indexedVideos))
	for _, video := range indexedVideos {
		// Normalize path for comparison
		normalizedPath := filepath.Clean(strings.ToLower(video.FilePath))
		indexedPaths[normalizedPath] = struct{}{}
	}

	// Step 3: Find unindexed videos
	var unindexed []string
	for _, path := range allVideoPaths {
		normalizedPath := filepath.Clean(strings.ToLower(path))
		if _, exists := indexedPaths[normalizedPath]; !exists {
			unindexed = append(unindexed, path)
		}
	}

	return unindexed, nil
}
