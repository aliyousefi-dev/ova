package storageoperations

import (
	"fmt"
	"ova-cli/source/videotools"
	"path/filepath"
)

// ProcessThumbnail generates a thumbnail image for the video at thumbTime (seconds)
// Returns the path to the thumbnail or error
func ProcessThumbnail(videoPath, videoID string, thumbTime float64) (string, error) {
	thumbDir := filepath.Join(".", ".ova-repo", "thumbnails")
	thumbPath := filepath.Join(thumbDir, videoID+".jpg")
	if err := videotools.GenerateThumbnail(videoPath, thumbPath, thumbTime); err != nil {
		return "", fmt.Errorf("generate thumbnail failed: %w", err)
	}
	return thumbPath, nil
}
