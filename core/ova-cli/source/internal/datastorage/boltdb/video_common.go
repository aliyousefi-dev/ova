package boltdb

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
	"path/filepath"
	"strings"
)

// AddVideo adds a new video if it does not already exist.
// Returns an error if a video with the same ID already exists.
func (b *BoltDB) AddVideo(video datatypes.VideoData) error {
	videos, err := b.loadVideos()
	if err != nil {
		return fmt.Errorf("failed to load videos: %w", err)
	}

	if _, exists := videos[video.VideoID]; exists {
		return fmt.Errorf("video with ID %q already exists", video.VideoID)
	}

	videos[video.VideoID] = video
	return b.saveVideos(videos)
}

// DeleteVideoByID removes a video by its ID.
// If the video does not exist, it's considered a no-op (no error is returned).
func (b *BoltDB) DeleteVideoByID(id string) error {
	videos, err := b.loadVideos()
	if err != nil {
		return fmt.Errorf("failed to load videos: %w", err)
	}

	delete(videos, id)
	return b.saveVideos(videos)
}

// GetVideoByID finds a video by its ID.
// Returns a pointer to VideoData if found, or an error if the video does not exist.
func (b *BoltDB) GetVideoByID(id string) (*datatypes.VideoData, error) {
	videos, err := b.loadVideos()
	if err != nil {
		return nil, fmt.Errorf("failed to load videos: %w", err)
	}

	video, found := videos[id]
	if !found {
		return nil, fmt.Errorf("video %q not found", id)
	}

	return &video, nil
}

// UpdateVideo replaces an existing video with the provided new video data.
// Returns an error if the video to be updated does not exist.
func (b *BoltDB) UpdateVideo(newVideo datatypes.VideoData) error {
	videos, err := b.loadVideos()
	if err != nil {
		return fmt.Errorf("failed to load videos: %w", err)
	}

	if _, exists := videos[newVideo.VideoID]; !exists {
		return fmt.Errorf("video %q not found for update", newVideo.VideoID)
	}

	videos[newVideo.VideoID] = newVideo
	return b.saveVideos(videos)
}

// GetFolderList returns a slice of unique folder paths where videos are stored.
// Paths are relative to the repository root.
func (b *BoltDB) GetFolderList() ([]string, error) {
	allVideosMap, err := b.loadVideos()
	if err != nil {
		return nil, fmt.Errorf("failed to load all videos for folder list: %w", err)
	}

	folderSet := make(map[string]struct{})

	for _, video := range allVideosMap {
		relPath := filepath.ToSlash(video.FilePath)
		folder := filepath.Dir(relPath)

		folder = strings.Trim(folder, "/")
		if folder == "." {
			folder = ""
		}
		folderSet[folder] = struct{}{}
	}

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
func (b *BoltDB) GetAllVideos() ([]datatypes.VideoData, error) {
	videosMap, err := b.loadVideos()
	if err != nil {
		return nil, fmt.Errorf("failed to load videos: %w", err)
	}

	videos := make([]datatypes.VideoData, 0, len(videosMap))
	for _, video := range videosMap {
		videos = append(videos, video)
	}
	return videos, nil
}

// DeleteAllVideos removes all videos from storage.
func (b *BoltDB) DeleteAllVideos() error {
	videos := make(map[string]datatypes.VideoData)
	return b.saveVideos(videos)
}

// GetVideosByFolder returns all videos located inside the specified folder path.
// The folderPath is expected to be a relative path with slashes normalized.
// If folderPath is empty, it returns videos in the root folder.
func (b *BoltDB) GetVideosByFolder(folderPath string) ([]datatypes.VideoData, error) {
	videosMap, err := b.loadVideos()
	if err != nil {
		return nil, fmt.Errorf("failed to load videos: %w", err)
	}

	folderPath = filepath.ToSlash(strings.Trim(folderPath, "/"))

	var results []datatypes.VideoData
	for _, video := range videosMap {
		videoFolder := filepath.ToSlash(filepath.Dir(video.FilePath))
		videoFolder = strings.Trim(videoFolder, "/")
		if videoFolder == "." {
			videoFolder = ""
		}

		if videoFolder == folderPath {
			results = append(results, video)
		}
	}

	return results, nil
}

// UpdateVideoLocalPath updates the file path of a video by its ID.
// Returns an error if the video is not found.
func (b *BoltDB) UpdateVideoLocalPath(videoID, newPath string) error {
	videos, err := b.loadVideos()
	if err != nil {
		return fmt.Errorf("failed to load videos: %w", err)
	}

	video, exists := videos[videoID]
	if !exists {
		return fmt.Errorf("video %q not found", videoID)
	}

	video.FilePath = newPath
	videos[videoID] = video

	return b.saveVideos(videos)
}

// GetTotalVideoCount returns the total count of videos stored.
func (b *BoltDB) GetTotalVideoCount() (int, error) {
	videos, err := b.loadVideos()
	if err != nil {
		return 0, fmt.Errorf("failed to load videos: %w", err)
	}
	return len(videos), nil
}
