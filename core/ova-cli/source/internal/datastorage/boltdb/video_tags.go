package boltdb

import (
	"fmt"
	"strings"
)

// GetTags retrieves the tags of a video by its ID.
func (b *BoltDB) GetTags(videoID string) ([]string, error) {
	video, err := b.GetVideoByID(videoID) // assume this method exists and handles concurrency
	if err != nil {
		return nil, err
	}
	return video.Tags, nil
}

// AddTagToVideo adds a tag to the specified video if it doesn't already exist (case-insensitive).
// Returns an error if the video is not found.
func (b *BoltDB) AddTagToVideo(videoID, tag string) error {
	videos, err := b.loadVideos()
	if err != nil {
		return fmt.Errorf("failed to load videos: %w", err)
	}

	video, exists := videos[videoID]
	if !exists {
		return fmt.Errorf("video %q not found", videoID)
	}

	normalizedTag := strings.ToLower(strings.TrimSpace(tag))

	for _, existingTag := range video.Tags {
		if strings.EqualFold(existingTag, normalizedTag) {
			return nil // tag already present, no change
		}
	}

	video.Tags = append(video.Tags, normalizedTag)
	videos[videoID] = video

	return b.saveVideos(videos)
}

// RemoveTagFromVideo removes a tag from the specified video if it exists (case-insensitive).
// Returns an error if the video is not found.
func (b *BoltDB) RemoveTagFromVideo(videoID, tag string) error {
	videos, err := b.loadVideos()
	if err != nil {
		return fmt.Errorf("failed to load videos: %w", err)
	}

	video, exists := videos[videoID]
	if !exists {
		return fmt.Errorf("video %q not found", videoID)
	}

	normalizedTag := strings.ToLower(strings.TrimSpace(tag))

	newTags := make([]string, 0, len(video.Tags))
	foundAndRemoved := false

	for _, existingTag := range video.Tags {
		if !strings.EqualFold(existingTag, normalizedTag) {
			newTags = append(newTags, existingTag)
		} else {
			foundAndRemoved = true
		}
	}

	if foundAndRemoved {
		video.Tags = newTags
		videos[videoID] = video
		return b.saveVideos(videos)
	}

	return nil // tag not found, no error
}
