package localstorage

import (
	"fmt"
	"os"
	"ova-cli/source/internal/datatypes"
	"ova-cli/source/internal/filehash"
	"ova-cli/source/internal/thirdparty"
	"ova-cli/source/internal/utils"
	"path/filepath"
	"strings"
)

// ProcessVideoForStorage handles the full pipeline of processing a video file
// for storage, including computing hash, checking existence, converting to fragmented MP4,
// extracting metadata, generating thumbnail and preview, and returning the structured VideoData.
func (s *LocalStorage) RegisterVideoForStorage(videoPath string) (datatypes.VideoData, error) {
	// 1. Compute a unique ID for the video based on its content hash.
	videoID, err := filehash.ComputeFileHash(videoPath)
	if err != nil {
		return datatypes.VideoData{}, fmt.Errorf("filehash compute failed for %s: %w", videoPath, err)
	}

	// 2. Load existing videos to check for duplicates.
	videos, err := s.loadVideos()
	if err != nil {
		return datatypes.VideoData{}, fmt.Errorf("failed to load existing videos: %w", err)
	}

	// If video with this ID already exists, check file path and update if needed.
	if existingVideo, exists := videos[videoID]; exists {
		// Convert incoming path to relative path based on repo root.
		relVideoPath, err := utils.MakeRelative(s.getRootRepositoryPath(), videoPath)
		if err != nil {
			return datatypes.VideoData{}, fmt.Errorf("failed to make path relative for existing video check: %w", err)
		}

		// If stored path differs, update it
		if existingVideo.FilePath != relVideoPath {
			if err := s.UpdateVideoLocalPath(videoID, relVideoPath); err != nil {
				return datatypes.VideoData{}, fmt.Errorf("video exists but failed to update file path: %w", err)
			}
			// Update in-memory struct to reflect new path
			existingVideo.FilePath = relVideoPath
		}
		return existingVideo, nil
	}

	// 4. Extract video metadata (duration, codecs, resolution).
	metadata, err := extractVideoMetadata(videoPath)
	if err != nil {
		return datatypes.VideoData{}, fmt.Errorf("failed to extract video metadata for %s: %w", videoPath, err)
	}

	// Calculate center time for thumbnail/preview generation.
	centerTime := float64(metadata.Duration) / 2.0

	// 5. Define paths for generated assets relative to the repository root.
	thumbDir := s.getThumbsDir()
	previewDir := s.getPreviewsDir()
	repoRoot := s.getRootRepositoryPath()

	// Construct absolute paths for thumbnail and preview files.
	thumbPath := filepath.Join(thumbDir, videoID+".jpg")
	previewPath := filepath.Join(previewDir, videoID+".webm")

	// 6. Generate thumbnail.
	if err := thirdparty.GenerateImageFromVideo(videoPath, thumbPath, centerTime); err != nil {
		return datatypes.VideoData{}, fmt.Errorf("failed to generate thumbnail for %s: %w", videoPath, err)
	}

	// 7. Generate preview.
	if err := thirdparty.GenerateWebMFromVideo(videoPath, previewPath, centerTime, 4.0); err != nil {
		if removeErr := os.Remove(thumbPath); removeErr != nil {
			fmt.Printf("Warning: Failed to remove thumbnail %s during preview generation error: %v\n", thumbPath, removeErr)
		}
		return datatypes.VideoData{}, fmt.Errorf("failed to generate preview for %s: %w", videoPath, err)
	}

	// 8. Convert absolute file paths to relative paths for storage.
	relVideoPath, err := utils.MakeRelative(repoRoot, videoPath)
	if err != nil {
		os.Remove(previewPath)
		os.Remove(thumbPath)
		return datatypes.VideoData{}, fmt.Errorf("failed to make video path relative (%s vs %s): %w", repoRoot, videoPath, err)
	}

	relThumbPath, err := utils.MakeRelative(repoRoot, thumbPath)
	if err != nil {
		os.Remove(previewPath)
		os.Remove(thumbPath)
		return datatypes.VideoData{}, fmt.Errorf("failed to make thumbnail path relative (%s vs %s): %w", repoRoot, thumbPath, err)
	}

	relPreviewPath, err := utils.MakeRelative(repoRoot, previewPath)
	if err != nil {
		os.Remove(previewPath)
		os.Remove(thumbPath)
		return datatypes.VideoData{}, fmt.Errorf("failed to make preview path relative (%s vs %s): %w", repoRoot, previewPath, err)
	}

	// 9. Construct the VideoData struct.
	video := datatypes.NewVideoData(
		videoID,
		strings.TrimSuffix(filepath.Base(videoPath), filepath.Ext(videoPath)),
		metadata.Duration,
		relVideoPath,
		&relThumbPath,
		&relPreviewPath,
		metadata.Resolution,
		metadata.MimeType,
	)

	return video, nil
}
