package repo

import (
	"fmt"
	"ova-cli/source/internal/thirdparty"
	"path/filepath"
)

// GenerateThumb generates a thumbnail image from a video file and returns the path to the generated thumbnail.
func (r *RepoManager) GenerateThumb(videoPath, videoId string) (string, error) {
	outputPath := filepath.Join(r.getThumbsDir(), videoId+".jpg")

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

	return outputPath, nil
}
