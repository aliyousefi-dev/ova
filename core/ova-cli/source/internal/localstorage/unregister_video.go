package localstorage

import (
	"fmt"
	"os"
	"ova-cli/source/internal/filehash"
	"path/filepath"
)

func (s *LocalStorage) UnregisterVideoFromStorage(videoPath string) error {
	// 1. Compute the video ID based on its content hash.
	videoID, err := filehash.ComputeFileHash(videoPath)
	if err != nil {
		return fmt.Errorf("filehash compute failed for %s: %w", videoPath, err)
	}

	// 2. Load existing videos.
	videos, err := s.loadVideos()
	if err != nil {
		return fmt.Errorf("failed to load existing videos: %w", err)
	}

	// 3. Find the video by ID.
	videoData, exists := videos[videoID]
	if !exists {
		return fmt.Errorf("video not found in storage: %s", videoPath)
	}

	// 4. Compute absolute paths for thumbnail and preview based on relative paths.
	repoRoot := s.getRootRepositoryPath()

	// Delete thumbnail if it exists
	if videoData.ThumbnailPath != nil {
		thumbPath := filepath.Join(repoRoot, *videoData.ThumbnailPath)
		if err := os.Remove(thumbPath); err != nil && !os.IsNotExist(err) {
			fmt.Printf("Warning: failed to delete thumbnail %s: %v\n", thumbPath, err)
		} else {
			fmt.Printf("Thumbnail deleted: %s\n", thumbPath)
		}
	}

	// Delete preview if it exists
	if videoData.PreviewPath != nil {
		previewPath := filepath.Join(repoRoot, *videoData.PreviewPath)
		if err := os.Remove(previewPath); err != nil && !os.IsNotExist(err) {
			fmt.Printf("Warning: failed to delete preview %s: %v\n", previewPath, err)
		} else {
			fmt.Printf("Preview deleted: %s\n", previewPath)
		}
	}

	// 5. Remove video entry from the map.
	delete(videos, videoID)

	// 6. Save updated videos back to storage.
	if err := s.saveVideos(videos); err != nil {
		return fmt.Errorf("failed to save updated video list after deletion: %w", err)
	}

	fmt.Printf("Video metadata removed: %s (ID: %s)\n", videoPath, videoID)
	return nil
}
