package boltdb

import (
	"fmt"
	"math/rand"
	"ova-cli/source/internal/datatypes"
	"path/filepath"
	"sort"
	"strings"
)

// GetSimilarVideos returns videos that share at least one tag with the given videoID.
// The target video itself is excluded from the results.
func (b *BoltDB) GetSimilarVideos(videoID string) ([]datatypes.VideoData, error) {
	videos, err := b.loadVideos()
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

		// Tag overlap
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

		// Duration similarity
		diff := float64(abs(targetVideo.DurationSeconds - video.DurationSeconds))
		switch {
		case diff < 30:
			score += 1.5
		case diff < 60:
			score += 1.0
		case diff < 120:
			score += 0.5
		}

		// Folder similarity
		if filepath.Dir(video.FilePath) == filepath.Dir(targetVideo.FilePath) {
			score += 1.0
		}

		if score > 0 {
			results = append(results, scoredVideo{video: video, score: score})
		}
	}

	// Sort descending by score
	sort.Slice(results, func(i, j int) bool {
		return results[i].score > results[j].score
	})

	// Take top 20
	var similar []datatypes.VideoData
	for i := 0; i < len(results) && i < 20; i++ {
		similar = append(similar, results[i].video)
	}

	// Fallback: if no similar videos, shuffle and return up to 20 random videos excluding target
	if len(similar) == 0 {
		for _, v := range videos {
			if v.VideoID != videoID {
				similar = append(similar, v)
			}
		}
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
// Returns matching videos or an error if criteria are empty.
func (b *BoltDB) SearchVideos(criteria datatypes.VideoSearchCriteria) ([]datatypes.VideoData, error) {
	query := strings.ToLower(strings.TrimSpace(criteria.Query))
	tags := make([]string, len(criteria.Tags))
	for i, tag := range criteria.Tags {
		tags[i] = strings.ToLower(strings.TrimSpace(tag))
	}

	if query == "" && len(tags) == 0 && criteria.MinRating == 0 && criteria.MaxDuration == 0 {
		return nil, fmt.Errorf("at least one search criteria must be provided (query, tags, minRating, or maxDuration)")
	}

	videos, err := b.loadVideos()
	if err != nil {
		return nil, fmt.Errorf("failed to load videos for search: %w", err)
	}

	resultsMap := make(map[string]datatypes.VideoData)

	filterExtras := func(video datatypes.VideoData) bool {
		if criteria.MaxDuration > 0 && video.DurationSeconds > criteria.MaxDuration {
			return false
		}
		return true
	}

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

	if query == "" && len(tags) == 0 {
		for _, video := range videos {
			if filterExtras(video) {
				resultsMap[video.VideoID] = video
			}
		}
	}

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

// GetSearchSuggestions returns a list of video titles that partially match the search query.
func (b *BoltDB) GetSearchSuggestions(query string) ([]string, error) {
	// Lock the BoltDB to ensure thread-safety (if necessary in your DB implementation)
	b.mu.Lock()
	defer b.mu.Unlock()

	// Use the existing GetAllVideos method to load the video data
	videos, err := b.GetAllVideos()
	if err != nil {
		return nil, fmt.Errorf("failed to load videos: %w", err)
	}

	// Trim and prepare the query
	query = strings.TrimSpace(query)
	if query == "" {
		return nil, fmt.Errorf("search query cannot be empty")
	}

	var suggestions []string

	// Iterate over the videos and check if the title contains the query (case-insensitive)
	for _, video := range videos {
		if strings.Contains(strings.ToLower(video.Title), strings.ToLower(query)) {
			suggestions = append(suggestions, video.Title)
		}
	}

	// Return the suggestions (or an empty list if no matches)
	return suggestions, nil
}
