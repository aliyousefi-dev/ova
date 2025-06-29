package repo

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

var videoExtensions = []string{".mp4"}

func (r *RepoManager) ScanDiskForVideos() ([]string, error) {
	var videos []string
	err := filepath.Walk(r.GetRootPath(), func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if info.IsDir() {
			if info.Name() == ".ova-server" {
				return filepath.SkipDir
			}
			return nil
		}
		if r.IsVideoFile(info.Name()) {
			videos = append(videos, path)
		}
		return nil
	})
	return videos, err
}

func (r *RepoManager) IsVideoFile(filename string) bool {
	lower := strings.ToLower(filename)
	for _, ext := range videoExtensions {
		if strings.HasSuffix(lower, ext) {
			return true
		}
	}
	return false
}

func (r *RepoManager) ScanDiskForFolders() ([]string, error) {

	var folders []string

	err := filepath.Walk(r.GetRootPath(), func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil // skip errors
		}

		if info.IsDir() {
			rel, relErr := filepath.Rel(r.GetRootPath(), path)
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

func (r *RepoManager) GetRepoSize() (int64, error) {
	ovaRepoPath := filepath.Join(r.GetRootPath(), ".ova-repo")

	// Check if .ova-repo exists
	err := r.IsRepoExists()
	if err != nil {
		return 0, errors.New(".ova-repo not found or is not a directory")
	}

	var totalSize int64

	err = filepath.Walk(r.GetRootPath(), func(path string, info os.FileInfo, err error) error {
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

func (r *RepoManager) GetVideoCountOnDisk() (int, error) {
	videoPaths, err := r.ScanDiskForVideos()
	if err != nil {
		return 0, err
	}
	return len(videoPaths), nil
}
