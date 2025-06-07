package repository

import (
	"os"
	"path/filepath"
	"strings"
)

var videoExtensions = []string{".mp4", ".mkv", ".avi", ".mov", ".flv", ".wmv"}

func IsVideoFile(filename string) bool {
	lower := strings.ToLower(filename)
	for _, ext := range videoExtensions {
		if strings.HasSuffix(lower, ext) {
			return true
		}
	}
	return false
}

func ScanVideos(root string) ([]string, error) {
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
