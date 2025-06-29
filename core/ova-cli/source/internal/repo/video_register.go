package repo

import (
	"fmt"
	"os"
	"ova-cli/source/internal/datatypes"
	"path/filepath"
	"strings"
)

// RegisterVideo handles hashing, thumbnail/preview generation, and metadata storage.
func (r *RepoManager) RegisterVideo(videoPath string) (datatypes.VideoData, error) {
	if !r.IsDataStorageExists() {
		return datatypes.VideoData{}, fmt.Errorf("data storage is not initialized")
	}

	// 1. Generate unique video ID
	videoID, err := r.GenerateVideoID(videoPath)
	if err != nil {
		return datatypes.VideoData{}, err
	}

	// 2. Extract metadata
	duration, err := r.GetVideoDuration(videoPath)
	if err != nil {
		return datatypes.VideoData{}, fmt.Errorf("failed to get duration: %w", err)
	}

	codec, err := r.GetVideoCodect(videoPath)
	if err != nil {
		return datatypes.VideoData{}, fmt.Errorf("failed to get codecs for file: %w", err)
	}

	resolution, err := r.GetVideoResolution(videoPath)
	if err != nil {
		return datatypes.VideoData{}, fmt.Errorf("failed to get resolution for %s: %w", videoPath, err)
	}

	// 3. Generate thumbnail and preview
	thumbPath, err := r.GenerateThumb(videoPath, videoID)
	if err != nil {
		return datatypes.VideoData{}, fmt.Errorf("failed to generate thumbnail: %w", err)
	}

	previewPath, err := r.GeneratePreview(videoPath, videoID)
	if err != nil {
		return datatypes.VideoData{}, fmt.Errorf("failed to generate preview: %w", err)
	}

	// 4. Compute relative paths
	relVideoPath, err := filepath.Rel(r.GetRootPath(), videoPath)
	if err != nil {
		return datatypes.VideoData{}, fmt.Errorf("failed to get relative video path: %w", err)
	}

	relThumbPath, err := filepath.Rel(r.GetRootPath(), thumbPath)
	if err != nil {
		return datatypes.VideoData{}, fmt.Errorf("failed to get relative thumbnail path: %w", err)
	}

	relPreviewPath, err := filepath.Rel(r.GetRootPath(), previewPath)
	if err != nil {
		return datatypes.VideoData{}, fmt.Errorf("failed to get relative preview path: %w", err)
	}

	// 5. Create and populate VideoData
	title := strings.TrimSuffix(filepath.Base(videoPath), filepath.Ext(videoPath))
	videoData := datatypes.NewVideoData(videoID)
	videoData.Title = title
	videoData.DurationSeconds = int(duration)
	videoData.Codecs = codec
	videoData.Resolution = resolution
	videoData.FilePath = relVideoPath
	videoData.ThumbnailPath = &relThumbPath
	videoData.PreviewPath = &relPreviewPath

	// 6. Store metadata
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

	// 2. Fetch existing video metadata
	videoData, err := r.dataStorage.GetVideoByID(videoID)
	if err != nil {
		return fmt.Errorf("failed to find video in storage: %w", err)
	}

	// 3. Resolve absolute paths
	repoRoot := r.GetRootPath()

	if videoData.ThumbnailPath != nil {
		thumbPath := filepath.Join(repoRoot, *videoData.ThumbnailPath)
		if err := os.Remove(thumbPath); err != nil && !os.IsNotExist(err) {
			fmt.Printf("Warning: failed to delete thumbnail: %s (%v)\n", thumbPath, err)
		} else {
			fmt.Printf("Thumbnail deleted: %s\n", thumbPath)
		}
	}

	if videoData.PreviewPath != nil {
		previewPath := filepath.Join(repoRoot, *videoData.PreviewPath)
		if err := os.Remove(previewPath); err != nil && !os.IsNotExist(err) {
			fmt.Printf("Warning: failed to delete preview: %s (%v)\n", previewPath, err)
		} else {
			fmt.Printf("Preview deleted: %s\n", previewPath)
		}
	}

	// 4. Remove metadata from storage
	if err := r.dataStorage.DeleteVideoByID(videoID); err != nil {
		return fmt.Errorf("failed to remove video metadata: %w", err)
	}

	fmt.Printf("Unregistered video: %s (ID: %s)\n", videoPath, videoID)
	return nil
}
