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
func (s *LocalStorage) ProcessVideoForStorage(videoPath string) (datatypes.VideoData, error) {
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

	// If video with this ID already exists, return its data to avoid re-processing.
	// This assumes loadVideos returns a map where videoID is the key.
	if existingVideo, exists := videos[videoID]; exists {
		// Log that the video already exists (optional, but good for debugging/monitoring)
		fmt.Printf("Video with ID %s (%s) already exists, skipping processing.\n", videoID, videoPath)
		return existingVideo, nil // Return the existing video data
	}

	// 4. Extract video metadata (duration, codecs, resolution).
	metadata, err := extractVideoMetadata(videoPath)
	if err != nil {
		return datatypes.VideoData{}, fmt.Errorf("failed to extract video metadata for %s: %w", videoPath, err)
	}

	// Calculate center time for thumbnail/preview generation.
	// Cast metadata.Duration (int) to float64 for accurate division.
	centerTime := float64(metadata.Duration) / 2.0

	// 5. Define paths for generated assets relative to the repository root.
	thumbDir := s.getThumbsDir()          // Absolute path to thumbnails directory
	previewDir := s.getPreviewsDir()      // Absolute path to previews directory
	repoRoot := s.getRootRepositoryPath() // Absolute path to the repository root

	// Construct absolute paths for thumbnail and preview files.
	thumbPath := filepath.Join(thumbDir, videoID+".jpg")
	previewPath := filepath.Join(previewDir, videoID+".webm")

	// 6. Generate thumbnail.
	fmt.Printf("Generating thumbnail for %s at %s...\n", videoPath, thumbPath)
	if err := thirdparty.GenerateImageFromVideo(videoPath, thumbPath, centerTime); err != nil {
		// No cleanup needed here yet as no files were successfully created.
		return datatypes.VideoData{}, fmt.Errorf("failed to generate thumbnail for %s: %w", videoPath, err)
	}
	fmt.Printf("Thumbnail generated at %s.\n", thumbPath)

	// 7. Generate preview.
	fmt.Printf("Generating preview for %s at %s...\n", videoPath, previewPath)
	if err := thirdparty.GenerateWebMFromVideo(videoPath, previewPath, centerTime, 4.0); err != nil {
		// If preview generation fails, clean up the already created thumbnail.
		if removeErr := os.Remove(thumbPath); removeErr != nil {
			fmt.Printf("Warning: Failed to remove thumbnail %s during preview generation error: %v\n", thumbPath, removeErr)
		}
		return datatypes.VideoData{}, fmt.Errorf("failed to generate preview for %s: %w", videoPath, err)
	}
	fmt.Printf("Preview generated at %s.\n", previewPath)

	// 8. Convert absolute file paths to paths relative to the repository root for storage.
	// These paths are what will be stored in the VideoData struct.
	relVideoPath, err := utils.MakeRelative(repoRoot, videoPath)
	if err != nil {
		// Clean up generated assets if relative path conversion fails.
		if removeErr := os.Remove(previewPath); removeErr != nil {
			fmt.Printf("Warning: Failed to remove preview %s during relative path conversion error: %v\n", previewPath, removeErr)
		}
		if removeErr := os.Remove(thumbPath); removeErr != nil {
			fmt.Printf("Warning: Failed to remove thumbnail %s during relative path conversion error: %v\n", thumbPath, removeErr)
		}
		return datatypes.VideoData{}, fmt.Errorf("failed to make video path relative (%s vs %s): %w", repoRoot, videoPath, err)
	}

	relThumbPath, err := utils.MakeRelative(repoRoot, thumbPath)
	if err != nil {
		// Clean up generated assets if relative path conversion fails.
		if removeErr := os.Remove(previewPath); removeErr != nil {
			fmt.Printf("Warning: Failed to remove preview %s during relative path conversion error: %v\n", previewPath, removeErr)
		}
		if removeErr := os.Remove(thumbPath); removeErr != nil {
			fmt.Printf("Warning: Failed to remove thumbnail %s during relative path conversion error: %v\n", thumbPath, removeErr)
		}
		return datatypes.VideoData{}, fmt.Errorf("failed to make thumbnail path relative (%s vs %s): %w", repoRoot, thumbPath, err)
	}

	relPreviewPath, err := utils.MakeRelative(repoRoot, previewPath)
	if err != nil {
		// Clean up generated assets if relative path conversion fails.
		if removeErr := os.Remove(previewPath); removeErr != nil {
			fmt.Printf("Warning: Failed to remove preview %s during relative path conversion error: %v\n", previewPath, removeErr)
		}
		if removeErr := os.Remove(thumbPath); removeErr != nil {
			fmt.Printf("Warning: Failed to remove thumbnail %s during relative path conversion error: %v\n", thumbPath, removeErr)
		}
		return datatypes.VideoData{}, fmt.Errorf("failed to make preview path relative (%s vs %s): %w", repoRoot, previewPath, err)
	}

	// 9. Construct the VideoData struct using the NewVideoData constructor.
	video := datatypes.NewVideoData( // Changed from datatypes.GenerateVideoJSON
		videoID,
		strings.TrimSuffix(filepath.Base(videoPath), filepath.Ext(videoPath)), // Title from filename
		metadata.Duration, // metadata.Duration is already int
		relVideoPath,
		&relThumbPath,   // Pass pointer to string for optional fields
		&relPreviewPath, // Pass pointer to string for optional fields
		metadata.Resolution,
		metadata.MimeType, // metadata.MimeType is already datatypes.Codecs
	)

	return video, nil
}
