package repo

import (
	"errors"
	"os"
	"path/filepath"
)

// CheckRepoExists checks if the .ova-repo folder exists at basePath.
func (r *RepoManager) IsRepoExists() error {
	ovaRepoPath := filepath.Join(r.GetRootPath(), ".ova-repo")
	info, err := os.Stat(ovaRepoPath)
	if err != nil || !info.IsDir() {
		return errors.New("repository does not exist")
	}
	return nil
}

func (r *RepoManager) IsDataStorageInitialized() bool {
	return r.diskDataStorage != nil && r.memoryDataStorage != nil
}

// FolderExists returns true if the folder exists and is a directory.
func (r *RepoManager) FolderExists(folderPath string) bool {
	// If folderPath is relative, make it absolute relative to root path
	if !filepath.IsAbs(folderPath) {
		folderPath = filepath.Join(r.GetRootPath(), folderPath)
	}

	info, err := os.Stat(folderPath)
	if err != nil {
		return false
	}
	return info.IsDir()
}
