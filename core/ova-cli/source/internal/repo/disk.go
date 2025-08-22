package repo

import (
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
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

func (r *RepoManager) ScanDiskForVideosRelPath() ([]string, error) {
	var videos []string
	rootPath := r.GetRootPath() // Get the root path of the repository

	err := filepath.Walk(rootPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if info.IsDir() {
			// Skip the ".ova-server" directory
			if info.Name() == ".ova-server" {
				return filepath.SkipDir
			}
			return nil
		}

		// Check if it's a video file
		if r.IsVideoFile(info.Name()) {
			// Get the relative path from the repository root to the video file
			relPath, err := filepath.Rel(rootPath, path)
			if err != nil {
				return err
			}

			// Append the relative path to the videos list
			videos = append(videos, relPath)
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
	exists := r.IsRepoExists()
	if !exists {
		return 0, fmt.Errorf(".ova-repo not found or is not a directory")
	}

	var totalSize int64

	err := filepath.Walk(r.GetRootPath(), func(path string, info os.FileInfo, err error) error {
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

// GetUnindexedVideos scans the disk for video files and returns the absolute paths of unindexed videos.
func (r *RepoManager) GetUnindexedVideos() ([]string, error) {
	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("data storage is not initialized")
	}

	// Fetch all already indexed videos
	indexedVideos, err := r.GetAllIndexedVideos()
	if err != nil {
		return nil, fmt.Errorf("failed to get indexed videos: %w", err)
	}

	// Create a set of video file paths for easy lookup
	indexedVideoPaths := make(map[string]struct{})
	for _, video := range indexedVideos {
		videoPath := filepath.Join(video.OwnedSpace, video.FileName)
		indexedVideoPaths[videoPath] = struct{}{}
	}

	// Scan the disk for video files and get their relative paths
	scannedVideoPaths, err := r.ScanDiskForVideosRelPath()
	if err != nil {
		return nil, fmt.Errorf("failed to scan disk for videos: %w", err)
	}

	// Get the root directory to convert relative paths to absolute paths
	rootPath := r.GetRootPath()

	// Filter out the video paths that are already indexed and convert to absolute paths
	var unindexedPaths []string
	for _, videoPath := range scannedVideoPaths {
		if _, exists := indexedVideoPaths[videoPath]; !exists {
			// Convert the relative path to an absolute path
			absolutePath := filepath.Join(rootPath, videoPath)
			unindexedPaths = append(unindexedPaths, absolutePath)
		}
	}

	return unindexedPaths, nil
}

// Define a struct to hold the result of each hashing operation
type VideoHashResult struct {
	RelPath string
	Hash    string
	Err     error
}

// ScanDiskForDuplicateVideos scans the repository for duplicate video files by checking their hashes.
// It returns a map where keys are video hashes and values are slices of relative paths
// that share that hash, effectively listing all duplicates.
func (r *RepoManager) ScanDiskForDuplicateVideos() (map[string][]string, error) {
	videoHashes := make(map[string][]string)
	duplicateVideos := make(map[string][]string)

	videoRelPaths, err := r.ScanDiskForVideos()
	if err != nil {
		return nil, fmt.Errorf("failed to scan disk for videos: %w", err)
	}

	// Use a buffered channel to collect results from goroutines
	// The buffer size can be tuned, but len(videoRelPaths) is a safe upper bound.
	results := make(chan VideoHashResult, len(videoRelPaths))
	var wg sync.WaitGroup

	// Determine the number of concurrent workers.
	// A common practice is to use GOMAXPROCS or a slightly higher number to account for I/O bound tasks.
	numWorkers := runtime.NumCPU() * 2 // Or a fixed number like 8, 16, depending on I/O capacity
	if numWorkers == 0 {               // Fallback if NumCPU returns 0 (unlikely)
		numWorkers = 4
	}

	// Use a worker pool pattern to limit concurrent file operations
	pathsToProcess := make(chan string, len(videoRelPaths))

	// Start worker goroutines
	for i := 0; i < numWorkers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for relPath := range pathsToProcess {
				videoID, err := r.GenerateVideoID(relPath)
				results <- VideoHashResult{RelPath: relPath, Hash: videoID, Err: err}
			}
		}()
	}

	// Send paths to the worker pool
	for _, relPath := range videoRelPaths {
		pathsToProcess <- relPath
	}
	close(pathsToProcess) // Signal that no more paths will be sent

	// Wait for all workers to finish
	wg.Wait()
	close(results) // Close the results channel once all workers are done

	// Collect and process results from the channel
	for res := range results {
		if res.Err != nil {
			fmt.Printf("Warning: Could not generate ID for video %s: %v\n", res.RelPath, res.Err)
			continue
		}
		videoHashes[res.Hash] = append(videoHashes[res.Hash], res.RelPath)
	}

	// Identify duplicates (this part remains the same)
	for hash, paths := range videoHashes {
		if len(paths) > 1 {
			duplicateVideos[hash] = paths
		}
	}

	return duplicateVideos, nil
}

// IsVideoFilePathExist checks if a video file exists at the specified absolute path.
func (r *RepoManager) IsVideoFilePathExist(absolutePath string) (bool, error) {
	// Check if the file exists at the absolute path
	info, err := os.Stat(absolutePath)
	if err != nil {
		if os.IsNotExist(err) {
			// The file does not exist
			return false, nil
		}
		// Some other error occurred (e.g., permission denied)
		return false, err
	}

	// Check if it's a valid video file
	if r.IsVideoFile(info.Name()) {
		return true, nil
	}

	// The file exists but is not a video file
	return false, nil
}
