package repository

import (
	"os"
	"path/filepath"
	"strings"
)

var videoExtensions = []string{".mp4"}

func IsVideoFile(filename string) bool {
	lower := strings.ToLower(filename)
	for _, ext := range videoExtensions {
		if strings.HasSuffix(lower, ext) {
			return true
		}
	}
	return false
}

func GetAllVideoPaths(root string) ([]string, error) {
	var videos []string
	err := filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if info.IsDir() {
			if info.Name() == ".ova-server" {
				return filepath.SkipDir
			}
			return nil
		}
		if IsVideoFile(info.Name()) {
			videos = append(videos, path)
		}
		return nil
	})
	return videos, err
}

// GetVideoCountInRepository returns the total number of video files in the given root directory.
func GetVideoCountInRepository(root string) (int, error) {
	videoPaths, err := GetAllVideoPaths(root)
	if err != nil {
		return 0, err
	}
	return len(videoPaths), nil
}
