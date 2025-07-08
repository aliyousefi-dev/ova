package repo

import (
	"fmt"
	"os"
	"ova-cli/source/internal/thirdparty"
	"path/filepath"
)

// GeneratePreview generates a .webm preview clip from a video and returns the output path.
func (r *RepoManager) GeneratePreview(videoPath, videoId string) (string, error) {
	// Get the output path for the preview using GetPreviewFilePathByVideoID
	outputPath := r.GetPreviewFilePathByVideoID(videoId)

	// Create the subfolder if it doesn't exist
	if err := os.MkdirAll(filepath.Dir(outputPath), os.ModePerm); err != nil {
		return "", fmt.Errorf("failed to create directory for preview: %w", err)
	}

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

	// Return the generated preview path
	return outputPath, nil
}
