package storageoperations

import (
	"fmt"
	"os"
	"path/filepath"
)

// RemoveThumbnail deletes the thumbnail file for the given videoID
func RemoveThumbnail(videoID string) error {
	thumbPath := filepath.Join(".", ".ova-repo", "thumbnails", videoID+".jpg")
	err := os.Remove(thumbPath)
	if err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("failed to remove thumbnail %s: %w", thumbPath, err)
	}
	return nil
}
