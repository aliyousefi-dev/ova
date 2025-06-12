package storage

import (
	"fmt"
	"os"
	"ova-cli/source/datatypes"
	"ova-cli/source/filehash"
	"ova-cli/source/utils"
	"ova-cli/source/videotools"
	"path/filepath"
	"strings"
)

// ProcessVideoForStorage handles full video processing pipeline:
// - Create file hash
// - Check if video exists in storage
// - If exists, check if fragmented; if not, convert to fragmented MP4
// - Generate thumbnail & preview centered on video duration
// - Add video metadata to storage
// - On failure, delete generated preview/thumbnail
func ProcessVideoForStorage(
	videoPath, repoRoot, thumbDir, previewDir string,
	storageManager *StorageManager,
) (datatypes.VideoData, error) {

	videoID, err := filehash.ComputeFileHash(videoPath)
	if err != nil {
		return datatypes.VideoData{}, fmt.Errorf("filehash compute failed: %w", err)
	}

	// Check if video already exists in storage
	_, err = storageManager.Videos.FindVideo(videoID)
	if err == nil {
		// Video already exists, skip by returning zero VideoData and no error
		return datatypes.VideoData{}, nil
	} else if !os.IsNotExist(err) && !strings.Contains(err.Error(), "not found") {
		return datatypes.VideoData{}, fmt.Errorf("storage find video error: %w", err)
	}

	// Check if video is fragmented mp4
	isFrag, err := videotools.IsFragmentedMP4(videoPath)
	if err != nil {
		return datatypes.VideoData{}, fmt.Errorf("checking fragmented mp4 failed: %w", err)
	}
	if !isFrag {
		// Convert to fragmented mp4 in place
		if err := videotools.ConvertMP4ToFragmentedMP4InPlace(videoPath); err != nil {
			return datatypes.VideoData{}, fmt.Errorf("convert to fragmented mp4 failed: %w", err)
		}
	}

	// Get video metadata
	metadata, err := videotools.GetVideoMetadata(videoPath)
	if err != nil {
		return datatypes.VideoData{}, fmt.Errorf("get video metadata failed: %w", err)
	}

	// Center time for thumbnail and preview
	centerTime := metadata.Duration / 2.0

	thumbPath := filepath.Join(thumbDir, videoID+".jpg")
	previewPath := filepath.Join(previewDir, videoID+".webm")

	// Generate thumbnail
	if err := videotools.GenerateThumbnail(videoPath, thumbPath, centerTime); err != nil {
		return datatypes.VideoData{}, fmt.Errorf("generate thumbnail failed: %w", err)
	}

	// Generate preview
	if err := videotools.GeneratePreviewWebM(videoPath, previewPath, centerTime, 4.0); err != nil {
		os.Remove(thumbPath)
		return datatypes.VideoData{}, fmt.Errorf("generate preview failed: %w", err)
	}

	// Make paths relative
	relVideoPath, err := utils.MakeRelative(repoRoot, videoPath)
	if err != nil {
		os.Remove(previewPath)
		os.Remove(thumbPath)
		return datatypes.VideoData{}, fmt.Errorf("make relative video path failed: %w", err)
	}
	relThumbPath, err := utils.MakeRelative(repoRoot, thumbPath)
	if err != nil {
		os.Remove(previewPath)
		os.Remove(thumbPath)
		return datatypes.VideoData{}, fmt.Errorf("make relative thumb path failed: %w", err)
	}
	relPreviewPath, err := utils.MakeRelative(repoRoot, previewPath)
	if err != nil {
		os.Remove(previewPath)
		os.Remove(thumbPath)
		return datatypes.VideoData{}, fmt.Errorf("make relative preview path failed: %w", err)
	}

	video := datatypes.GenerateVideoJSON(
		videoID,
		strings.TrimSuffix(filepath.Base(videoPath), filepath.Ext(videoPath)),
		int(metadata.Duration),
		relVideoPath,
		&relThumbPath,
		&relPreviewPath,
		metadata.Resolution,
		metadata.MimeType,
	)

	// Return the video metadata but don't add to storage here
	return video, nil
}
