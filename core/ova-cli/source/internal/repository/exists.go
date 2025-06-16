package repository

import (
	"errors"
	"os"
	"path/filepath"
)

// CheckRepoExists checks if the .ova-repo folder exists at basePath.
func CheckRepoExists(basePath string) error {
	ovaRepoPath := filepath.Join(basePath, ".ova-repo")
	info, err := os.Stat(ovaRepoPath)
	if err != nil || !info.IsDir() {
		return errors.New("repository does not exist")
	}
	return nil
}

// FolderExists checks if the specified folder exists and is a directory.
func FolderExists(basePath string) bool {
	info, err := os.Stat(basePath)
	return err == nil && info.IsDir()
}
