package repo

import (
	"path/filepath"
	"strings"
)

func (r *RepoManager) GetUnindexedVideos() ([]string, error) {
	// 1. Get all indexed videos from data storage
	indexedVideos, err := r.dataStorage.GetAllVideos()
	if err != nil {
		return nil, err
	}

	// 2. Get all videos on disk
	allVideoPaths, err := r.ScanDiskForVideos()
	if err != nil {
		return nil, err
	}

	// 3. Build map for quick lookup of indexed video paths
	indexedPaths := make(map[string]struct{}, len(indexedVideos))
	for _, video := range indexedVideos {
		normalizedPath := filepath.Clean(strings.ToLower(video.FilePath))
		indexedPaths[normalizedPath] = struct{}{}
	}

	// 4. Collect unindexed videos
	var unindexed []string
	for _, path := range allVideoPaths {
		normalizedPath := filepath.Clean(strings.ToLower(path))
		if _, exists := indexedPaths[normalizedPath]; !exists {
			unindexed = append(unindexed, path)
		}
	}

	return unindexed, nil
}
