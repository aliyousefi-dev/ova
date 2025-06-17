package repository

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// GetAllFolders lists all folders under basePath excluding .ova-repo,
// and ensures the folder is a valid repository.
func GetAllFolders(basePath string) ([]string, error) {
	ovaRepoPath := filepath.Join(basePath, ".ova-repo")

	// Ensure .ova-repo exists and is a directory
	info, err := os.Stat(ovaRepoPath)
	if err != nil || !info.IsDir() {
		return nil, errors.New(".ova-repo not found or is not a directory")
	}

	var folders []string

	err = filepath.Walk(basePath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil // skip errors
		}

		if info.IsDir() {
			rel, relErr := filepath.Rel(basePath, path)
			if relErr != nil {
				return nil
			}

			// Skip .ova-repo and any hidden subfolders
			if rel == ".ova-repo" || strings.HasPrefix(rel, ".ova-repo"+string(os.PathSeparator)) {
				return filepath.SkipDir
			}
			if rel != "." && strings.HasPrefix(info.Name(), ".") {
				return filepath.SkipDir
			}

			// Skip the root itself
			if rel != "." {
				folders = append(folders, rel)
			}
		}
		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to get folders: %w", err)
	}

	return folders, nil
}
