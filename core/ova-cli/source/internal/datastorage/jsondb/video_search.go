package jsondb

import (
	"fmt"
	"math/rand/v2"
	"ova-cli/source/internal/datatypes"
	"path/filepath"
	"sort"
	"strings"
)

// GetSimilarVideos returns videos that share at least one tag with the given videoID.
// The target video itself is excluded from the results.
func (s *JsonDB) GetSimilarVideos(videoID string) ([]datatypes.VideoData, error) {
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

// SearchVideos searches videos based on the provided criteria.
// It returns a slice of matching videos.
// Returns an error if no meaningful search criteria are provided.
func (s *JsonDB) SearchVideos(criteria datatypes.VideoSearchCriteria) ([]datatypes.VideoData, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	query := strings.ToLower(strings.TrimSpace(criteria.Query))
	tags := make([]string, len(criteria.Tags))
	for i, tag := range criteria.Tags {
		tags[i] = strings.ToLower(strings.TrimSpace(tag))
	}

	if query == "" && len(tags) == 0 && criteria.MinRating == 0 && criteria.MaxDuration == 0 {
		return nil, fmt.Errorf("at least one search criteria must be provided (query, tags, minRating, or maxDuration)")
	}

	videos, err := s.loadVideos()
	if err != nil {
		return nil, fmt.Errorf("failed to load videos for search: %w", err)
	}

	// Use a map to track videos already added by ID, to avoid duplicates
	resultsMap := make(map[string]datatypes.VideoData)

	// Helper function to apply rating and duration filters
	filterExtras := func(video datatypes.VideoData) bool {
		if criteria.MinRating > 0 && video.Rating < criteria.MinRating {
			return false
		}
		if criteria.MaxDuration > 0 && video.DurationSeconds > criteria.MaxDuration {
			return false
		}
		return true
	}

	// Search by query
	if query != "" {
		for _, video := range videos {
			if strings.Contains(strings.ToLower(video.Title), query) ||
				strings.Contains(strings.ToLower(video.Description), query) {
				if filterExtras(video) {
					resultsMap[video.VideoID] = video
				}
			}
		}
	}

	// Search by tags
	if len(tags) > 0 {
		for _, video := range videos {
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
			if matchesTags && filterExtras(video) {
				resultsMap[video.VideoID] = video
			}
		}
	}

	// If no query or tags provided (but minRating or maxDuration were), include all that pass filters
	if query == "" && len(tags) == 0 {
		for _, video := range videos {
			if filterExtras(video) {
				resultsMap[video.VideoID] = video
			}
		}
	}

	// Convert map to slice
	var results []datatypes.VideoData
	for _, video := range resultsMap {
		results = append(results, video)
	}

	return results, nil
}

func abs(n int) int {
	if n < 0 {
		return -n
	}
	return n
}
