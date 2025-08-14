package repo

import (
	"fmt"
	"os"
	"path/filepath"
)

func (r *RepoManager) CreateSpaceDirectory(space string) error {
	// Get the root path for the space
	rootPath := r.GetRootPath()

	// Create the space directory
	spaceDir := filepath.Join(rootPath, space)
	err := os.MkdirAll(spaceDir, os.ModePerm)
	if err != nil {
		return fmt.Errorf("failed to create space directory: %w", err)
	}

	return nil
}

func (r *RepoManager) DeleteSpaceDirectory(space string) error {
	// Get the root path for the space
	rootPath := r.GetRootPath()

	// Create the space directory
	spaceDir := filepath.Join(rootPath, space)
	err := os.RemoveAll(spaceDir)
	if err != nil {
		return fmt.Errorf("failed to delete space directory: %w", err)
	}

	return nil
}

func (r *RepoManager) CreateSubSpace(parentSpace string, subSpaceName string) error {
	// Get the root path for the parent space
	parentPath := r.GetRootPath()

	// Create the sub-space directory
	subSpaceDir := filepath.Join(parentPath, parentSpace, subSpaceName)
	err := os.MkdirAll(subSpaceDir, os.ModePerm)
	if err != nil {
		return fmt.Errorf("failed to create sub-space directory: %w", err)
	}

	return nil
}

func (r *RepoManager) DeleteSubSpace(parentSpace string, subSpaceName string) error {
	// Get the root path for the parent space
	parentPath := r.GetRootPath()

	// Create the sub-space directory
	subSpaceDir := filepath.Join(parentPath, parentSpace, subSpaceName)
	err := os.RemoveAll(subSpaceDir)
	if err != nil {
		return fmt.Errorf("failed to delete sub-space directory: %w", err)
	}

	return nil
}
