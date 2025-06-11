package storage

import (
	"ova-cli/source/datatypes"
	"ova-cli/source/videotools"
	"path/filepath"
)

// In package videotools (or videotools/processor.go)
func GenerateVideoPreviewAndThumbnail(
	videoPath, thumbDir, previewDir, videoID string,
) (
	metadata datatypes.VideoMetadata,
	thumbPath string,
	previewPath string,
	err error,
) {
	metadata, err = videotools.GetVideoMetadata(videoPath)
	if err != nil {
		return
	}

	thumbTime := metadata.Duration / 3.0
	thumbPath = filepath.Join(thumbDir, videoID+".jpg")
	err = videotools.GenerateThumbnail(videoPath, thumbPath, thumbTime)
	if err != nil {
		return
	}

	previewPath = filepath.Join(previewDir, videoID+".webm")
	err = videotools.GeneratePreviewWebM(videoPath, previewPath, thumbTime, 4.0)
	if err != nil {
		// Log but don't fail entire process? Up to you. Here we return err.
		return
	}

	return
}
