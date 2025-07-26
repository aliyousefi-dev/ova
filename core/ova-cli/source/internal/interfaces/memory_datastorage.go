package interfaces

import "ova-cli/source/internal/datatypes"

// MemoryDataStorage defines methods for user and video data operations without context.
type MemoryDataStorage interface {
	// Get all cached video IDs (or metadata as required)
	GetAllCachedVideoIds() ([]string, error)

	// Get videos in a specific range (e.g., 0 to 10, 10 to 50)
	GetSortedVideosInRange(start, end int) ([]string, error)

		// Get the total count of videos cached in memory
	GetTotalVideosCached() (int, error)

	// Clears all videos in the memory storage 
	ClearAll() error

	// Imports videos and sorts them by their upload date
	CacheVideosByUploadDate(videos []datatypes.VideoData) error
}
