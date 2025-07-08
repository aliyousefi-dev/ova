package repo

import (
	"fmt"
	"os"
	"ova-cli/source/internal/thirdparty"
	"path/filepath"
)

// GenerateThumb generates a thumbnail image from a video file and returns the path to the generated thumbnail.
func (r *RepoManager) GenerateThumb(videoPath, videoId string) (string, error) {
	// Get the output path for the thumbnail using GetThumbnailFilePathByVideoID
	outputPath := r.GetThumbnailFilePathByVideoID(videoId)

	// Create the subfolder if it doesn't exist
	if err := os.MkdirAll(filepath.Dir(outputPath), os.ModePerm); err != nil {
		return "", fmt.Errorf("failed to create directory for thumbnail: %w", err)
	}

	// 1. Extract video duration
	duration, err := r.GetVideoDuration(videoPath)
	if err != nil {
		return "", fmt.Errorf("failed to get duration: %w", err)
	}

	// 2. Calculate center time for thumbnail generation.
	centerTime := duration / 2.0

	// 3. Generate thumbnail image.
	if err := thirdparty.GenerateImageFromVideo(videoPath, outputPath, centerTime); err != nil {
		return "", fmt.Errorf("failed to generate thumbnail for %s: %w", videoPath, err)
	}

	// Return the generated thumbnail path
	return outputPath, nil
}
