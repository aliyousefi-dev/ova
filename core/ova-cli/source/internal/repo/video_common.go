package repo

import (
	"fmt"
	"strings"

	"ova-cli/source/internal/datatypes"
)

// AddVideo adds a new video if it does not already exist.
func (r *RepoManager) AddVideo(video datatypes.VideoData) error {
	if !r.IsDataStorageExists() {
		return fmt.Errorf("data storage is not initialized")
	}

	// Check if video exists
	_, err := r.GetVideoByID(video.VideoID)
	if err == nil {
		// Video exists, so return error
		return fmt.Errorf("video with ID %q already exists", video.VideoID)
	}
	if err != nil {
		// If error is something other than "not found", return it
		if !strings.Contains(err.Error(), "not found") {
			return err
		}
		// else err indicates video not found, so continue to add
	}

	// Add video since it does not exist
	return r.dataStorage.AddVideo(video)
}

// DeleteVideoByID removes a video by its ID.
func (r *RepoManager) DeleteVideoByID(id string) error {
	if !r.IsDataStorageExists() {
		return fmt.Errorf("data storage is not initialized")
	}
	return r.dataStorage.DeleteVideoByID(id)
}

// GetVideoByID returns video data by ID.
func (r *RepoManager) GetVideoByID(id string) (*datatypes.VideoData, error) {
	if !r.IsDataStorageExists() {
		return nil, fmt.Errorf("data storage is not initialized")
	}
	return r.dataStorage.GetVideoByID(id)
}

// GetFolderList returns unique folder paths containing videos.
func (r *RepoManager) GetFolderList() ([]string, error) {
	if !r.IsDataStorageExists() {
		return nil, fmt.Errorf("data storage is not initialized")
	}
	return r.dataStorage.GetFolderList()
}

// GetAllVideos returns all videos.
func (r *RepoManager) GetAllVideos() ([]datatypes.VideoData, error) {
	if !r.IsDataStorageExists() {
		return nil, fmt.Errorf("data storage is not initialized")
	}
	return r.dataStorage.GetAllVideos()
}

// DeleteAllVideos removes all videos.
func (r *RepoManager) DeleteAllVideos() error {
	if !r.IsDataStorageExists() {
		return fmt.Errorf("data storage is not initialized")
	}
	return r.dataStorage.DeleteAllVideos()
}

// GetVideosByFolder returns all videos inside specified folder.
func (r *RepoManager) GetVideosByFolder(folderPath string) ([]datatypes.VideoData, error) {
	if !r.IsDataStorageExists() {
		return nil, fmt.Errorf("data storage is not initialized")
	}
	return r.dataStorage.GetVideosByFolder(folderPath)
}

// UpdateVideoLocalPath updates the file path of a video by its ID.
func (r *RepoManager) UpdateVideoLocalPath(videoID, newPath string) error {
	if !r.IsDataStorageExists() {
		return fmt.Errorf("data storage is not initialized")
	}
	return r.dataStorage.UpdateVideoLocalPath(videoID, newPath)
}

// GetTotalVideoCount returns total number of videos.
func (r *RepoManager) GetTotalVideoCount() (int, error) {
	if !r.IsDataStorageExists() {
		return 0, fmt.Errorf("data storage is not initialized")
	}
	return r.dataStorage.GetTotalVideoCount()
}
