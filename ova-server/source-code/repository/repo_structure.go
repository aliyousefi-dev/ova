package repository

import (
	"fmt"
	"os"
	"path/filepath"
)

func CheckRepoStructure(repoBasePath string) error {
	expectedPaths := []string{
		filepath.Join(repoBasePath, "config.json"),
		filepath.Join(repoBasePath, "storage"),
		filepath.Join(repoBasePath, "storage", "users.json"),
		filepath.Join(repoBasePath, "storage", "videos.json"),
		filepath.Join(repoBasePath, "thumbnails"),
	}

	for _, path := range expectedPaths {
		info, err := os.Stat(path)
		if err != nil {
			if os.IsNotExist(err) {
				return fmt.Errorf("missing required path: %s", path)
			}
			return fmt.Errorf("error accessing path %s: %v", path, err)
		}

		// Ensure folders are directories and files are files
		if filepath.Base(path) == "storage" || filepath.Base(path) == "thumbnails" {
			if !info.IsDir() {
				return fmt.Errorf("expected directory: %s", path)
			}
		} else {
			if info.IsDir() {
				return fmt.Errorf("expected file: %s", path)
			}
		}
	}

	return nil
}
