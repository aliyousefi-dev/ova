package repo

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
	"ova-cli/source/internal/utils"
	"path/filepath"
	"strings"
)

// IndexVideo handles hashing, thumbnail/preview generation, and metadata storage.
func (r *RepoManager) IndexVideo(absolutePath string) (datatypes.VideoData, error) {
	if !r.IsDataStorageInitialized() {
		return datatypes.VideoData{}, fmt.Errorf("data storage is not initialized")
	}

	// 1. Check if the video file exists using the absolute path
	exists, err := r.IsVideoFilePathExist(absolutePath)
	if err != nil {
		return datatypes.VideoData{}, fmt.Errorf("failed to check video file existence: %w", err)
	}
	if !exists {
		return datatypes.VideoData{}, fmt.Errorf("video file does not exist: %s", absolutePath)
	}

	// 2. Get the root directory of the repository (or base directory)
	rootPath := r.GetRootPath() // Assuming this is a method that gets the root path

	// 3. Generate the relative path from rootPath to absolutePath
	relativePath, err := utils.MakeRelative(rootPath, absolutePath)
	if err != nil {
		return datatypes.VideoData{}, fmt.Errorf("failed to generate relative path: %w", err)
	}

	pathSegments := utils.GetPathSegments(filepath.Dir(relativePath))

	// 4. Generate unique video ID
	videoID, err := r.GenerateVideoID(absolutePath)
	if err != nil {
		return datatypes.VideoData{}, err
	}

	if r.CheckVideoIndexedByID(videoID) {
		return datatypes.VideoData{}, fmt.Errorf("video with ID %s is already indexed", videoID)
	}

	codec, err := r.GetVideoCodect(absolutePath)
	if err != nil {
		return datatypes.VideoData{}, fmt.Errorf("failed to get codecs for file: %w", err)
	}

	// 6. Generate thumbnail and preview
	_, err = r.GenerateThumb(absolutePath, videoID)
	if err != nil {
		return datatypes.VideoData{}, fmt.Errorf("failed to generate thumbnail: %w", err)
	}

	_, err = r.GeneratePreview(absolutePath, videoID)
	if err != nil {
		return datatypes.VideoData{}, fmt.Errorf("failed to generate preview: %w", err)
	}

	// 7. Create and populate VideoData
	title := strings.TrimSuffix(filepath.Base(absolutePath), filepath.Ext(absolutePath))
	videoData := datatypes.NewVideoData(videoID)
	videoData.FileName = title
	videoData.Codecs = codec
	videoData.OwnedSpace = pathSegments.Root
	videoData.OwnedGroup = pathSegments.Subroot

	r.diskDataStorage.AddVideoIDToSpace(videoID, relativePath)

	// 8. Store metadata
	if err := r.diskDataStorage.AddVideo(videoData); err != nil {
		return datatypes.VideoData{}, fmt.Errorf("failed to save video metadata: %w", err)
	}

	return videoData, nil
}

func (r *RepoManager) IndexMultiVideos(absolutePaths []string, progressChan chan int, errorChan chan error) ([]datatypes.VideoData, error) {
	var indexedVideos []datatypes.VideoData
	totalVideos := len(absolutePaths)

	// If a progressChan is provided, initialize progress to 0
	if progressChan != nil {
		progressChan <- 0 // Initialize progress to 0
	}

	for i, absPath := range absolutePaths {
		// Index the video
		videoData, err := r.IndexVideo(absPath)
		if err != nil {
			if errorChan != nil {
				errorChan <- fmt.Errorf("failed to index video %s: %w", absPath, err)
			}
			// Continue to next video instead of returning
			continue
		}

		// Append the successfully indexed video
		indexedVideos = append(indexedVideos, videoData)

		// Calculate progress as a percentage (0-100)
		progress := int((float64(i+1) / float64(totalVideos)) * 100)

		// Send progress update if progressChan is provided
		if progressChan != nil {
			progressChan <- progress
		}
	}

	// Final progress update to 100% if progressChan is provided
	if progressChan != nil {
		progressChan <- 100
		// Do not close progressChan here; let the caller close it if needed
	}

	return indexedVideos, nil
}

// UnIndexVideo removes a video and its related files and metadata.
func (r *RepoManager) UnIndexVideo(videoPath string) error {
	if !r.IsDataStorageInitialized() {
		return fmt.Errorf("data storage is not initialized")
	}

	// 1. Compute video ID
	videoID, err := r.GenerateVideoID(videoPath)
	if err != nil {
		return fmt.Errorf("failed to compute video ID: %w", err)
	}
	// 	previewPath := filepath.Join(repoRoot, *videoData.PreviewPath)
	// 	if err := os.Remove(previewPath); err != nil && !os.IsNotExist(err) {
	// 		fmt.Printf("Warning: failed to delete preview: %s (%v)\n", previewPath, err)
	// 	} else {
	// 		fmt.Printf("Preview deleted: %s\n", previewPath)
	// 	}
	// }

	// 4. Remove metadata from storage
	if err := r.diskDataStorage.DeleteVideoByID(videoID); err != nil {
		return fmt.Errorf("failed to remove video metadata: %w", err)
	}

	fmt.Printf("Unregistered video: %s (ID: %s)\n", videoPath, videoID)
	return nil
}
