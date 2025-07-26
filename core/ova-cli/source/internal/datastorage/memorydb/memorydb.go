package memorydb

import (
	"fmt"
	"sort"
	"sync"

	"ova-cli/source/internal/datatypes" // Assuming this path is correct for VideoData
	"ova-cli/source/internal/interfaces"
)

// MemoryDB implements the MemoryDataStorage interface using Go's built-in types.
// It stores video data in memory, optimized for retrieval by upload date.
type MemoryDB struct {
	// videosMap provides quick lookup of VideoData by VideoID.
	// This is useful if you need to retrieve a full VideoData struct by its ID.
	videosMap map[string]datatypes.VideoData
	// sortedVideos stores all VideoData entries, kept sorted by UploadedAt
	// in descending order (most recent first). This enables efficient range queries.
	sortedVideos []datatypes.VideoData
	// mu protects concurrent access to videosMap and sortedVideos.
	// A RWMutex allows multiple readers or a single writer.
	mu sync.RWMutex
}

// NewMemoryDB initializes the in-memory database.
// It returns a pointer to a new MemoryDB instance or an error if initialization fails.
func NewMemoryDB() (*MemoryDB, error) {
	return &MemoryDB{
		videosMap:    make(map[string]datatypes.VideoData),
		sortedVideos: make([]datatypes.VideoData, 0),
	}, nil
}

// Ensure MemoryDB implements the MemoryDataStorage interface at compile time.
// This line will cause a compile-time error if MemoryDB does not satisfy the interface.
var _ interfaces.MemoryDataStorage = (*MemoryDB)(nil)

// GetAllCachedVideoIds returns a slice of all video IDs currently cached in memory.
// It acquires a read lock to ensure thread safety.
func (m *MemoryDB) GetAllCachedVideoIds() ([]string, error) {
	m.mu.RLock() // Acquire a read lock
	defer m.mu.RUnlock() // Ensure the read lock is released when the function exits

	// Iterate over the sortedVideos slice to get IDs.
	// This slice contains all cached videos and is already available.
	ids := make([]string, 0, len(m.sortedVideos)) // Pre-allocate capacity for efficiency
	for _, video := range m.sortedVideos {
		ids = append(ids, video.VideoID)
	}
	return ids, nil
}

// GetSortedVideosInRange returns video IDs within a specified range (start, end),
// based on their upload date. The videos are sorted from most recent to oldest.
// It acquires a read lock to ensure thread safety.
func (m *MemoryDB) GetSortedVideosInRange(start, end int) ([]string, error) {
	m.mu.RLock() // Acquire a read lock
	defer m.mu.RUnlock() // Ensure the read lock is released

	total := len(m.sortedVideos)

	// Validate input range.
	if start < 0 || start >= total {
		return nil, fmt.Errorf("start index %d out of bounds (total videos: %d)", start, total)
	}
	if end < start {
		return nil, fmt.Errorf("end index %d cannot be less than start index %d", end, start)
	}
	// Adjust end index if it exceeds the total number of videos.
	if end > total {
		end = total
	}

	// Extract video IDs from the relevant portion of the sorted slice.
	var resultIDs []string
	// The capacity of the result slice is (end - start) for efficiency.
	resultIDs = make([]string, 0, end-start)
	for i := start; i < end; i++ {
		resultIDs = append(resultIDs, m.sortedVideos[i].VideoID)
	}
	return resultIDs, nil
}

// GetTotalVideosCached returns the total count of videos currently cached in memory.
// It acquires a read lock to ensure thread safety.
func (m *MemoryDB) GetTotalVideosCached() (int, error) {
	m.mu.RLock() // Acquire a read lock
	defer m.mu.RUnlock() // Ensure the read lock is released
	return len(m.sortedVideos), nil
}

// ClearAll clears all video data from the memory storage.
// It acquires a write lock to ensure exclusive access during the clear operation.
func (m *MemoryDB) ClearAll() error {
	m.mu.Lock() // Acquire a write lock
	defer m.mu.Unlock() // Ensure the write lock is released

	// Reinitialize the map and slice to clear all data.
	m.videosMap = make(map[string]datatypes.VideoData)
	m.sortedVideos = make([]datatypes.VideoData, 0)
	return nil
}

// CacheVideosByUploadDate imports a slice of VideoData, clears any existing data,
// and then populates and sorts the in-memory store by upload date (most recent first).
// It acquires a write lock to ensure exclusive access during the caching and sorting.
func (m *MemoryDB) CacheVideosByUploadDate(videos []datatypes.VideoData) error {
	m.mu.Lock() // Acquire a write lock
	defer m.mu.Unlock() // Ensure the write lock is released

	// Clear existing data before caching new data to prevent duplicates or stale entries.
	m.videosMap = make(map[string]datatypes.VideoData)
	// Pre-allocate capacity for the sortedVideos slice for efficiency.
	m.sortedVideos = make([]datatypes.VideoData, 0, len(videos))

	// Populate the map and the slice with the new video data.
	for _, video := range videos {
		m.videosMap[video.VideoID] = video       // Store in map for quick lookup by ID
		m.sortedVideos = append(m.sortedVideos, video) // Add to slice for sorting
	}

	// Sort the slice by UploadedAt in descending order (most recent first).
	sort.Slice(m.sortedVideos, func(i, j int) bool {
		return m.sortedVideos[i].UploadedAt.After(m.sortedVideos[j].UploadedAt)
	})

	return nil
}

