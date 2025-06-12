package storageoperations

import (
	"fmt"
	"os"
	"ova-cli/source/videotools"
	"path/filepath"
)

// ProcessPreview generates a preview video snippet for the video at thumbTime (seconds)
// Returns the path to the preview or error
func ProcessPreview(videoPath, videoID string, videoDuration float64) (string, error) {
	previewDir := filepath.Join(".", ".ova-repo", "previews")
	previewPath := filepath.Join(previewDir, videoID+".webm")

	thumbTime := videoDuration / 2.0
	const previewDuration = 4.0

	if err := videotools.GeneratePreviewWebM(videoPath, previewPath, thumbTime, previewDuration); err != nil {
		os.Remove(previewPath)
		return "", fmt.Errorf("generate preview failed: %w", err)
	}
	return previewPath, nil
}
