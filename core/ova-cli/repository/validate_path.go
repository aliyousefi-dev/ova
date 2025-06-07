package repository

import (
	"errors"
	"fmt"
	"path/filepath"
	"strings"
)

// ValidatePathInRepo checks if the given path is inside the repo directory.
func ValidatePathInRepo(repoBasePath, targetPath string) error {
	absRepoPath, err := filepath.Abs(repoBasePath)
	if err != nil {
		return fmt.Errorf("failed to resolve repo base path: %w", err)
	}
	absTargetPath, err := filepath.Abs(targetPath)
	if err != nil {
		return fmt.Errorf("failed to resolve target path: %w", err)
	}

	rel, err := filepath.Rel(absRepoPath, absTargetPath)
	if err != nil {
		return fmt.Errorf("failed to check path relationship: %w", err)
	}

	// If rel starts with ".." or is equal to "..", target is outside repo
	if strings.HasPrefix(rel, "..") || rel == ".." {
		return errors.New("path is outside the repository")
	}
	return nil
}
