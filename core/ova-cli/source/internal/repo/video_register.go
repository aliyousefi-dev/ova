package repo

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
	"ova-cli/source/internal/utils"
	"path/filepath"
	"strings"
)

// RegisterVideoWithAbsolutePath handles hashing, thumbnail/preview generation, and metadata storage.
func (r *RepoManager) RegisterVideoWithAbsolutePath(absolutePath string) (datatypes.VideoData, error) {
	if !r.IsDataStorageExists() {
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
	rootPath := r.GetRootPath()  // Assuming this is a method that gets the root path

	// 3. Generate the relative path from rootPath to absolutePath
	relativePath, err := utils.MakeRelative(rootPath, absolutePath)
	if err != nil {
		return datatypes.VideoData{}, fmt.Errorf("failed to generate relative path: %w", err)
	}

	// 4. Generate unique video ID
	videoID, err := r.GenerateVideoID(absolutePath)
	if err != nil {
		return datatypes.VideoData{}, err
	}

	// 5. Extract metadata
	duration, err := r.GetVideoDuration(absolutePath)
	if err != nil {
		return datatypes.VideoData{}, fmt.Errorf("failed to get duration: %w", err)
	}

	codec, err := r.GetVideoCodect(absolutePath)
	if err != nil {
		return datatypes.VideoData{}, fmt.Errorf("failed to get codecs for file: %w", err)
	}

	resolution, err := r.GetVideoResolution(absolutePath)
	if err != nil {
		return datatypes.VideoData{}, fmt.Errorf("failed to get resolution for %s: %w", absolutePath, err)
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
	videoData.Title = title
	videoData.DurationSeconds = int(duration)
	videoData.Codecs = codec
	videoData.Resolution = resolution
	videoData.FilePath = relativePath   // Use the relative path here

	// 8. Store metadata
	if err := r.dataStorage.AddVideo(videoData); err != nil {
		return datatypes.VideoData{}, fmt.Errorf("failed to save video metadata: %w", err)
	}

	return videoData, nil
}

// UnregisterVideo removes a video and its related files and metadata.
func (r *RepoManager) UnregisterVideo(videoPath string) error {
	if !r.IsDataStorageExists() {
		return fmt.Errorf("data storage is not initialized")
	}

	// 1. Compute video ID
	videoID, err := r.GenerateVideoID(videoPath)
	if err != nil {
		return fmt.Errorf("failed to compute video ID: %w", err)
	}

	// // 2. Fetch existing video metadata
	// videoData, err := r.dataStorage.GetVideoByID(videoID)
	// if err != nil {
	// 	return fmt.Errorf("failed to find video in storage: %w", err)
	// }

	// // 3. Resolve absolute paths
	// repoRoot := r.GetRootPath()

	// if videoData.ThumbnailPath != nil {
	// 	thumbPath := filepath.Join(repoRoot, *videoData.ThumbnailPath)
	// 	if err := os.Remove(thumbPath); err != nil && !os.IsNotExist(err) {
	// 		fmt.Printf("Warning: failed to delete thumbnail: %s (%v)\n", thumbPath, err)
	// 	} else {
	// 		fmt.Printf("Thumbnail deleted: %s\n", thumbPath)
	// 	}
	// }

	// if videoData.PreviewPath != nil {
	// 	previewPath := filepath.Join(repoRoot, *videoData.PreviewPath)
	// 	if err := os.Remove(previewPath); err != nil && !os.IsNotExist(err) {
	// 		fmt.Printf("Warning: failed to delete preview: %s (%v)\n", previewPath, err)
	// 	} else {
	// 		fmt.Printf("Preview deleted: %s\n", previewPath)
	// 	}
	// }

	// 4. Remove metadata from storage
	if err := r.dataStorage.DeleteVideoByID(videoID); err != nil {
		return fmt.Errorf("failed to remove video metadata: %w", err)
	}

	fmt.Printf("Unregistered video: %s (ID: %s)\n", videoPath, videoID)
	return nil
}
