package repo

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// GroupScan represents a directory group within a space.
type GroupScan struct {
	GroupName string      `json:"group"`  // Name of the group (folder)
	Files     []string    `json:"files"`  // Files inside this group
	Groups    []GroupScan `json:"groups"` // Nested groups (subfolders)
}

// SpaceScan represents a top-level disk space (e.g., "root").
type SpaceScan struct {
	Space  string      `json:"space"`  // Name of the space (root or folder)
	Files  []string    `json:"files"`  // Files directly under this space
	Groups []GroupScan `json:"groups"` // Groups inside this space (subfolders)
}

// ScanDiskForSpaces scans the disk for spaces and groups.
func (r *RepoManager) ScanDiskForSpaces() ([]SpaceScan, error) {
	rootPath := r.GetRootPath()
	var spaces []SpaceScan

	// Use a map to track files found to avoid duplicates
	foundFiles := make(map[string]bool)

	// Step 1: Create the root space and scan for files directly in it.
	rootSpace := SpaceScan{
		Space: "root",
	}

	entries, err := os.ReadDir(rootPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read root directory: %w", err)
	}

	for _, entry := range entries {
		// Skip hidden files and the .ova-repo directory
		if strings.HasPrefix(entry.Name(), ".") {
			continue
		}

		fullPath := filepath.Join(rootPath, entry.Name())
		relPath, err := filepath.Rel(rootPath, fullPath)
		if err != nil {
			return nil, err
		}

		if !entry.IsDir() && isVideoFile(relPath) && !foundFiles[relPath] {
			rootSpace.Files = append(rootSpace.Files, relPath)
			foundFiles[relPath] = true
		}
	}

	spaces = append(spaces, rootSpace)

	// Step 2: Iterate through top-level directories and create a new DiskSpaceScan for each.
	for _, entry := range entries {
		if entry.IsDir() && !strings.HasPrefix(entry.Name(), ".") {
			dirPath := filepath.Join(rootPath, entry.Name())
			dirSpace := SpaceScan{
				Space: entry.Name(),
			}

			// Scan this top-level directory recursively to populate its groups and files.
			// The base case for this recursion is when there are no more subdirectories.
			group, err := r.scanGroup(dirPath, dirPath, foundFiles)
			if err != nil {
				return nil, err
			}

			// The top-level directory's files are moved to the space, and its sub-groups are added.
			dirSpace.Files = group.Files
			dirSpace.Groups = group.Groups

			spaces = append(spaces, dirSpace)
		}
	}

	return spaces, nil
}

// scanGroup scans a directory recursively and returns a GroupScan.
// The `basePath` is used to calculate relative paths correctly.
func (r *RepoManager) scanGroup(path string, basePath string, foundFiles map[string]bool) (GroupScan, error) {
	group := GroupScan{
		GroupName: filepath.Base(path),
	}

	entries, err := os.ReadDir(path)
	if err != nil {
		// Log a warning but continue, as some directories might be inaccessible
		fmt.Printf("Warning: Failed to read directory %s: %v\n", path, err)
		return group, nil
	}

	for _, entry := range entries {
		// Skip hidden files and the .ova-repo directory
		if strings.HasPrefix(entry.Name(), ".") {
			continue
		}

		fullPath := filepath.Join(path, entry.Name())
		relPath, err := filepath.Rel(r.GetRootPath(), fullPath)
		if err != nil {
			return group, err
		}

		if entry.IsDir() {
			// Recursively scan the subdirectory
			subGroup, err := r.scanGroup(fullPath, basePath, foundFiles)
			if err != nil {
				return group, err
			}
			// Always add the subgroup to show the full directory structure
			group.Groups = append(group.Groups, subGroup)
		} else {
			// Add file to the group if it's a video file and not already added
			if isVideoFile(relPath) && !foundFiles[relPath] {
				group.Files = append(group.Files, relPath)
				foundFiles[relPath] = true
			}
		}
	}

	return group, nil
}

// isVideoFile is a helper function to check if a file has a video extension.
func isVideoFile(path string) bool {
	ext := strings.ToLower(filepath.Ext(path))
	// You can add more video formats here if needed
	return ext == ".mp4" || ext == ".mkv" || ext == ".avi" || ext == ".mov"
}

// GetVideosFromSpaceScan extracts all video file paths from a SpaceScan and its nested groups.
// It performs a recursive traversal of the directory structure.
func (r *RepoManager) GetVideosFromSpaceScan(space SpaceScan) []string {
	var videos []string

	// Start by adding files directly in the space
	videos = append(videos, space.Files...)

	// Recursively get files from all nested groups
	for _, group := range space.Groups {
		videos = append(videos, getVideosFromGroupScan(group)...)
	}

	return videos
}

// getVideosFromGroupScan is a recursive helper function to get all videos from a GroupScan.
func getVideosFromGroupScan(group GroupScan) []string {
	var videos []string

	// Add files directly in the current group
	videos = append(videos, group.Files...)

	// Recursively get files from all nested subgroups
	for _, subGroup := range group.Groups {
		videos = append(videos, getVideosFromGroupScan(subGroup)...)
	}

	return videos
}
