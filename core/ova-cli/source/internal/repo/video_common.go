package repo

import (
	"fmt"

	"ova-cli/source/internal/datatypes"
)

// AddVideo adds a new video if it does not already exist.
func (r *RepoManager) AddVideo(video datatypes.VideoData) error {
	if !r.IsDataStorageInitialized() {
		return fmt.Errorf("data storage is not initialized")
	}

	if r.CheckVideoIndexedByID(video.VideoID) {
		return fmt.Errorf("video with ID %q already exists", video.VideoID)
	}

	// Add video to database
	return r.diskDataStorage.AddVideo(video)
}

// AddVideo adds a new video if it does not already exist.
func (r *RepoManager) AddOneVideo(VideoPath string, cook bool) error {
	if !r.IsDataStorageInitialized() {
		return fmt.Errorf("data storage is not initialized")
	}

	// indexing video
	_, err := r.IndexVideo(VideoPath)
	if err != nil {
		return fmt.Errorf("failed to index video with path %q: %w", VideoPath, err)
	}

	// optionality cook video if enabled
	if cook {
		if err := r.CookOneVideo(VideoPath); err != nil {
			return fmt.Errorf("failed to cook video with path %q: %w", VideoPath, err)
		}
	}

	// Add video since it does not exist
	return nil
}

func (r *RepoManager) AddMultiVideos(
	VideoPaths []string,
	indexingProgressChan chan int,
	stateChan chan string,
	indexingErrorChan chan error,
) error {
	// Defer closing all channels to ensure they are always closed
	// even if an error occurs and the function returns early.
	defer close(indexingProgressChan)
	defer close(indexingErrorChan)
	defer close(stateChan)

	// Index all videos at once with progress and error tracking
	_, err := r.IndexMultiVideos(VideoPaths, indexingProgressChan, indexingErrorChan)
	if err != nil {
		return err // The deferred close statements will handle channel cleanup
	}

	// All videos processed successfully
	stateChan <- "Completed" // Final state
	return nil
}

// DeleteVideoByID removes a video by its ID.
func (r *RepoManager) DeleteVideoByID(id string) error {
	if !r.IsDataStorageInitialized() {
		return fmt.Errorf("data storage is not initialized")
	}
	return r.UnIndexVideo(id)
}

// GetFolderList returns unique folder paths containing videos.
func (r *RepoManager) GetFolderList() ([]string, error) {
	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.GetFolderList()
}

// GetAllIndexedVideos returns all videos.
func (r *RepoManager) GetAllIndexedVideos() ([]datatypes.VideoData, error) {
	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.GetAllVideos()
}

// DeleteAllVideos removes all videos.
func (r *RepoManager) DeleteAllVideos() error {
	if !r.IsDataStorageInitialized() {
		return fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.DeleteAllVideos()
}

// GetIndxedVideosOnSpace returns all videos inside specified folder.
func (r *RepoManager) GetIndxedVideosOnSpace(space string) ([]datatypes.VideoData, error) {
	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.GetVideosBySpace(space)
}

// UpdateVideoLocalPath updates the file path of a video by its ID.
func (r *RepoManager) UpdateVideoLocalPath(videoID, newPath string) error {
	if !r.IsDataStorageInitialized() {
		return fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.UpdateVideoLocalPath(videoID, newPath)
}

// GetTotalIndexedVideoCount returns total number of videos.
func (r *RepoManager) GetTotalIndexedVideoCount() (int, error) {
	if !r.IsDataStorageInitialized() {
		return 0, fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.GetTotalVideoCount()
}
