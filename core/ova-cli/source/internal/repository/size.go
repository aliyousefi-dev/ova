package repository

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// GetWorkspaceSize calculates the total size of all files under basePath,
// excluding the .ova-repo directory.
func GetWorkspaceSize(basePath string) (int64, error) {
	ovaRepoPath := filepath.Join(basePath, ".ova-repo")

	// Check if .ova-repo exists
	info, err := os.Stat(ovaRepoPath)
	if err != nil || !info.IsDir() {
		return 0, errors.New(".ova-repo not found or is not a directory")
	}

	var totalSize int64

	err = filepath.Walk(basePath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil // skip unreadable files
		}

		// Skip anything under .ova-repo
		if strings.HasPrefix(path, ovaRepoPath) {
			return nil
		}

		if !info.IsDir() {
			totalSize += info.Size()
		}
		return nil
	})
	if err != nil {
		return 0, fmt.Errorf("failed to calculate workspace size: %w", err)
	}

	return totalSize, nil
}
