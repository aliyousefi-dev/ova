package repo

import (
	"fmt"
	"ova-cli/source/internal/thirdparty"
	"path/filepath"
)

// GeneratePreview generates a .webm preview clip from a video and returns the output path.
func (r *RepoManager) GeneratePreview(videoPath, videoId string) (string, error) {
	outputPath := filepath.Join(r.getPreviewsDir(), videoId+".webm")

	// 1. Extract video duration
	duration, err := r.GetVideoDuration(videoPath)
	if err != nil {
		return "", fmt.Errorf("failed to get duration: %w", err)
	}

	// 2. Calculate center time for preview generation
	centerTime := duration / 2.0

	// 3. Generate preview video
	if err := thirdparty.GenerateWebMFromVideo(videoPath, outputPath, centerTime, 4.0); err != nil {
		return "", fmt.Errorf("failed to generate preview for %s: %w", videoPath, err)
	}

	return outputPath, nil
}
