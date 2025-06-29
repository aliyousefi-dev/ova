package jsondb

import (
	"fmt"
	"strings"
)

// GetTags retrieves the tags of a video by its ID.
func (s *JsonDB) GetTags(videoID string) ([]string, error) {
	video, err := s.GetVideoByID(videoID)
	if err != nil {
		return nil, err
	}
	return video.Tags, nil
}

// AddTagToVideo adds a tag to the specified video if it doesn't already exist (case-insensitive).
// Returns an error if the video is not found.
func (s *JsonDB) AddTagToVideo(videoID, tag string) error {
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

	// Normalize the tag to lowercase
	normalizedTag := strings.ToLower(strings.TrimSpace(tag))

	// Check if the tag already exists (case-insensitive)
	for _, existingTag := range video.Tags {
		if strings.EqualFold(existingTag, normalizedTag) {
			return nil // Tag already exists, no need to add
		}
	}

	// Add the normalized (lowercase) tag
	video.Tags = append(video.Tags, normalizedTag)
	videos[videoID] = video

	return s.saveVideos(videos)
}

// RemoveTagFromVideo removes a tag from the specified video if it exists (case-insensitive).
// Returns an error if the video is not found.
func (s *JsonDB) RemoveTagFromVideo(videoID, tag string) error {
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
