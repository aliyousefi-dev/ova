package repo

import (
	"fmt"
)

// CacheLatestVideos caches the latest videos by upload date into memory.
func (r *RepoManager) CacheLatestVideos() error {
	// Ensure that the data storage is initialized
	if !r.IsDataStorageInitialized() {
		return fmt.Errorf("data storage is not initialized")
	}

	// Get all videos from disk storage (handle any potential errors)
	allVideos, err := r.GetAllIndexedVideos()
	if err != nil {
		return fmt.Errorf("failed to get all videos from disk storage: %w", err)
	}

	// Cache videos by upload date into memory storage
	if err := r.memoryDataStorage.CacheVideosByUploadDate(allVideos); err != nil {
		return fmt.Errorf("failed to cache videos by upload date: %w", err)
	}

	return nil
}

// GetSortedVideosByRange retrieves video IDs within a specific range, sorted by upload date.
func (r *RepoManager) GetSortedVideosByRange(start, end int) ([]string, error) {
	// Ensure that the data storage is initialized
	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("data storage is not initialized")
	}

	// Fetch the video IDs in the given range from memory storage
	videoIDsInRange, err := r.memoryDataStorage.GetSortedVideosInRange(start, end)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve video IDs in range: %w", err)
	}

	return videoIDsInRange, nil
}

func (r *RepoManager) GetTotalVideosCached() (int, error) {
	// Ensure that the data storage is initialized
	if !r.IsDataStorageInitialized() {
		return 0, fmt.Errorf("data storage is not initialized")
	}

	// Fetch the total count of cached videos from memory storage
	totalCount, err := r.memoryDataStorage.GetTotalVideosCached()
	if err != nil {
		return 0, fmt.Errorf("failed to retrieve total cached videos count: %w", err)
	}

	return totalCount, nil
}

func (r *RepoManager) GetAllCachedVideos() ([]string, error) {
	// Ensure that the data storage is initialized
	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("data storage is not initialized")
	}

	// Fetch all cached video IDs from memory storage
	videoIds, err := r.memoryDataStorage.GetAllCachedVideoIds()
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve cached video IDs: %w", err)
	}

	return videoIds, nil
}
