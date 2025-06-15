package localstorage

import (
	"fmt" // os is not directly used in the provided functions, but good to keep if used elsewhere in the package.
	"math/rand/v2"
	"ova-cli/source/internal/datatypes"
	"path/filepath"
	"sort"
	"strings"
)

// AddVideo adds a new video if it does not already exist.
// Returns an error if a video with the same ID already exists.
func (s *LocalStorage) AddVideo(video datatypes.VideoData) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	videos, err := s.loadVideos()
	if err != nil {
		return fmt.Errorf("failed to load videos: %w", err)
	}

	if _, exists := videos[video.VideoID]; exists {
		return fmt.Errorf("video with ID %q already exists", video.VideoID)
	}

	videos[video.VideoID] = video
	return s.saveVideos(videos)
}

// DeleteVideo removes a video by its ID.
// If the video does not exist, it's considered a no-op (no error is returned).
func (s *LocalStorage) DeleteVideo(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	videos, err := s.loadVideos()
	if err != nil {
		return fmt.Errorf("failed to load videos: %w", err)
	}

	// The delete operation is safe even if the key doesn't exist.
	delete(videos, id)
	return s.saveVideos(videos)
}

// GetVideoByID finds a video by its ID.
// Returns a pointer to VideoData if found, or an error if the video does not exist.
func (s *LocalStorage) GetVideoByID(id string) (*datatypes.VideoData, error) {
	s.mu.Lock() // Added lock for read operation, consistency with other methods
	defer s.mu.Unlock()

	videos, err := s.loadVideos()
	if err != nil {
		return nil, fmt.Errorf("failed to load videos: %w", err)
	}

	video, found := videos[id]
	if !found {
		return nil, fmt.Errorf("video %q not found", id)
	}
	// Return a pointer to a copy of the video data from the map.
	// This prevents external modification of the map's internal data without going through the setter.
	return &video, nil
}

// UpdateVideo replaces an existing video with the provided new video data.
// Returns an error if the video to be updated does not exist.
func (s *LocalStorage) UpdateVideo(newVideo datatypes.VideoData) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	videos, err := s.loadVideos()
	if err != nil {
		return fmt.Errorf("failed to load videos: %w", err)
	}

	if _, exists := videos[newVideo.VideoID]; !exists {
		return fmt.Errorf("video %q not found for update", newVideo.VideoID)
	}

	videos[newVideo.VideoID] = newVideo
	return s.saveVideos(videos)
}

// SearchVideos searches videos based on the provided criteria.
// It returns a slice of matching videos.
// Returns an error if no meaningful search criteria are provided.
func (s *LocalStorage) SearchVideos(criteria datatypes.VideoSearchCriteria) ([]datatypes.VideoData, error) {
	s.mu.Lock() // Added lock for read operation, consistency with other methods
	defer s.mu.Unlock()

	query := strings.ToLower(strings.TrimSpace(criteria.Query))
	tags := make([]string, len(criteria.Tags))
	for i, tag := range criteria.Tags {
		tags[i] = strings.ToLower(strings.TrimSpace(tag)) // Normalize search tags
	}

	// Ensure at least one search criterion is provided.
	if query == "" && len(tags) == 0 && criteria.MinRating == 0 && criteria.MaxDuration == 0 {
		return nil, fmt.Errorf("at least one search criteria must be provided (query, tags, minRating, or maxDuration)")
	}

	videos, err := s.loadVideos()
	if err != nil {
		return nil, fmt.Errorf("failed to load videos for search: %w", err)
	}

	var results []datatypes.VideoData
	for _, video := range videos {
		// Filter by query (title and description, case-insensitive)
		if query != "" &&
			!(strings.Contains(strings.ToLower(video.Title), query) ||
				strings.Contains(strings.ToLower(video.Description), query)) { // Added description search
			continue
		}

		// Filter by tags if provided
		if len(tags) > 0 {
			matchesTags := false
			for _, searchTag := range tags {
				for _, videoTag := range video.Tags {
					if strings.EqualFold(searchTag, videoTag) {
						matchesTags = true
						break
					}
				}
				if matchesTags {
					break
				}
			}
			if !matchesTags {
				continue
			}
		}

		// Filter by minimum rating if set
		if criteria.MinRating > 0 && video.Rating < criteria.MinRating {
			continue
		}

		// Filter by maximum duration if set (assuming video.Duration is in seconds)
		if criteria.MaxDuration > 0 && video.DurationSeconds > criteria.MaxDuration {
			continue
		}

		results = append(results, video)
	}

	return results, nil
}

// GetTags retrieves the tags of a video by its ID.
func (s *LocalStorage) GetTags(videoID string) ([]string, error) {
	video, err := s.GetVideoByID(videoID)
	if err != nil {
		return nil, err
	}
	return video.Tags, nil
}

// AddTagToVideo adds a tag to the specified video if it doesn't already exist (case-insensitive).
// Returns an error if the video is not found.
func (s *LocalStorage) AddTagToVideo(videoID, tag string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	videos, err := s.loadVideos()
	if err != nil {
		return fmt.Errorf("failed to load videos: %w", err)
	}

	video, exists := videos[videoID]
	if !exists {
		return fmt.Errorf("video %q not found", videoID)
	}

	// Normalize the tag to be added for case-insensitive comparison
	normalizedTag := strings.ToLower(strings.TrimSpace(tag))

	// Check if tag already exists (case-insensitive)
	for _, existingTag := range video.Tags {
		if strings.EqualFold(existingTag, normalizedTag) {
			return nil // Tag already exists, no need to add
		}
	}

	// Add the new tag (preserving its original casing if desired, or use normalizedTag)
	video.Tags = append(video.Tags, tag) // Storing the original case of the tag
	videos[videoID] = video
	return s.saveVideos(videos)
}

// RemoveTagFromVideo removes a tag from the specified video if it exists (case-insensitive).
// Returns an error if the video is not found.
func (s *LocalStorage) RemoveTagFromVideo(videoID, tag string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	videos, err := s.loadVideos()
	if err != nil {
		return fmt.Errorf("failed to load videos: %w", err)
	}

	video, exists := videos[videoID]
	if !exists {
		return fmt.Errorf("video %q not found", videoID)
	}

	// Normalize the tag to be removed for case-insensitive comparison
	normalizedTag := strings.ToLower(strings.TrimSpace(tag))

	// Filter out the tag (case-insensitive)
	newTags := make([]string, 0, len(video.Tags))
	foundAndRemoved := false
	for _, existingTag := range video.Tags {
		if !strings.EqualFold(existingTag, normalizedTag) {
			newTags = append(newTags, existingTag)
		} else {
			foundAndRemoved = true // Mark that the tag was found and will be removed
		}
	}

	// Only save if a tag was actually removed to prevent unnecessary disk writes.
	if foundAndRemoved {
		video.Tags = newTags
		videos[videoID] = video
		return s.saveVideos(videos)
	}

	return nil // Tag not found or no change, no error
}

// GetFolderList returns a slice of unique folder paths where videos are stored.
// Paths are relative to the repository root.
func (s *LocalStorage) GetFolderList() ([]string, error) {
	s.mu.Lock() // Added lock for read operation
	defer s.mu.Unlock()

	// Directly load all videos instead of using SearchVideos with empty criteria.
	allVideosMap, err := s.loadVideos()
	if err != nil {
		return nil, fmt.Errorf("failed to load all videos for folder list: %w", err)
	}

	folderSet := make(map[string]struct{})

	for _, video := range allVideosMap {
		// Ensure paths are consistently slash-separated
		relPath := filepath.ToSlash(video.FilePath)
		folder := filepath.Dir(relPath)

		// Trim leading/trailing slashes and handle root directory
		folder = strings.Trim(folder, "/")
		if folder == "." { // If it's the current directory (root of the repo)
			folder = "" // Represent root as an empty string
		}
		folderSet[folder] = struct{}{}
	}

	// Convert set keys to slice
	folders := make([]string, 0, len(folderSet)+1)
	folders = append(folders, "") // Always include root folder as empty string
	for folder := range folderSet {
		if folder != "" {
			folders = append(folders, folder)
		}
	}

	return folders, nil
}

// GetAllVideos returns all videos currently in storage as a slice.
func (s *LocalStorage) GetAllVideos() ([]datatypes.VideoData, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	videosMap, err := s.loadVideos()
	if err != nil {
		return nil, fmt.Errorf("failed to load videos: %w", err)
	}

	// Convert map to slice
	videos := make([]datatypes.VideoData, 0, len(videosMap))
	for _, video := range videosMap {
		videos = append(videos, video)
	}
	return videos, nil
}

// DeleteAllVideos removes all videos from storage.
func (s *LocalStorage) DeleteAllVideos() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Clear all videos by resetting the map
	videos := make(map[string]datatypes.VideoData)

	return s.saveVideos(videos)
}

// GetVideosByFolder returns all videos located inside the specified folder path.
// The folderPath is expected to be a relative path with slashes normalized.
// If folderPath is empty, it returns videos in the root folder.
func (s *LocalStorage) GetVideosByFolder(folderPath string) ([]datatypes.VideoData, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	videosMap, err := s.loadVideos()
	if err != nil {
		return nil, fmt.Errorf("failed to load videos: %w", err)
	}

	// Normalize folder path to slash-separated and trimmed, empty string means root
	folderPath = filepath.ToSlash(strings.Trim(folderPath, "/"))

	var results []datatypes.VideoData
	for _, video := range videosMap {
		// Normalize video's folder path
		videoFolder := filepath.ToSlash(filepath.Dir(video.FilePath))
		videoFolder = strings.Trim(videoFolder, "/")
		if videoFolder == "." {
			videoFolder = ""
		}

		// Match normalized folder paths
		if videoFolder == folderPath {
			results = append(results, video)
		}
	}

	return results, nil
}

// GetSimilarVideos returns videos that share at least one tag with the given videoID.
// The target video itself is excluded from the results.
func (s *LocalStorage) GetSimilarVideos(videoID string) ([]datatypes.VideoData, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	videos, err := s.loadVideos()
	if err != nil {
		return nil, fmt.Errorf("failed to load videos: %w", err)
	}

	targetVideo, exists := videos[videoID]
	if !exists {
		return nil, fmt.Errorf("video %q not found", videoID)
	}

	type scoredVideo struct {
		video datatypes.VideoData
		score float64
	}

	var results []scoredVideo

	for id, video := range videos {
		if id == videoID {
			continue
		}

		score := 0.0

		// Tag overlap (if tags exist)
		if len(targetVideo.Tags) > 0 && len(video.Tags) > 0 {
			targetTags := make(map[string]struct{})
			for _, tag := range targetVideo.Tags {
				targetTags[strings.ToLower(tag)] = struct{}{}
			}
			for _, tag := range video.Tags {
				if _, ok := targetTags[strings.ToLower(tag)]; ok {
					score += 2.0
				}
			}
		}

		// Title word overlap (case-insensitive)
		targetWords := strings.Fields(strings.ToLower(targetVideo.Title))
		videoWords := strings.Fields(strings.ToLower(video.Title))
		wordMatch := 0
		for _, w1 := range targetWords {
			for _, w2 := range videoWords {
				if w1 == w2 {
					wordMatch++
				}
			}
		}
		score += float64(wordMatch)

		// Duration similarity (closer durations are better)
		diff := float64(abs(targetVideo.DurationSeconds - video.DurationSeconds))
		if diff < 30 {
			score += 1.5
		} else if diff < 60 {
			score += 1.0
		} else if diff < 120 {
			score += 0.5
		}

		// Optional: folder similarity
		if filepath.Dir(video.FilePath) == filepath.Dir(targetVideo.FilePath) {
			score += 1.0
		}

		// Add if score is non-zero
		if score > 0 {
			results = append(results, scoredVideo{video: video, score: score})
		}
	}

	// Sort by descending score
	sort.Slice(results, func(i, j int) bool {
		return results[i].score > results[j].score
	})

	// Return top N similar videos
	var similar []datatypes.VideoData
	for i := 0; i < len(results) && i < 20; i++ {
		similar = append(similar, results[i].video)
	}

	// Fallback: if no results, return top-viewed or random
	if len(similar) == 0 {
		for _, v := range videos {
			if v.VideoID != videoID {
				similar = append(similar, v)
			}
		}
		// Shuffle and limit
		rand.Shuffle(len(similar), func(i, j int) {
			similar[i], similar[j] = similar[j], similar[i]
		})
		if len(similar) > 20 {
			similar = similar[:20]
		}
	}

	return similar, nil
}

func abs(n int) int {
	if n < 0 {
		return -n
	}
	return n
}

// UpdateVideoLocalPath updates the file path of a video by its ID.
// Returns an error if the video is not found.
func (s *LocalStorage) UpdateVideoLocalPath(videoID, newPath string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	videos, err := s.loadVideos()
	if err != nil {
		return fmt.Errorf("failed to load videos: %w", err)
	}

	video, exists := videos[videoID]
	if !exists {
		return fmt.Errorf("video %q not found", videoID)
	}

	video.FilePath = newPath
	videos[videoID] = video

	return s.saveVideos(videos)
}
