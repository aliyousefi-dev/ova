package storageoperations

import (
	"fmt"
	"os"
	"path/filepath"
)

// RemovePreview deletes the preview file for the given videoID
func RemovePreview(videoID string) error {
	previewPath := filepath.Join(".", ".ova-repo", "previews", videoID+".webm")
	err := os.Remove(previewPath)
	if err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("failed to remove preview %s: %w", previewPath, err)
	}
	return nil
}
