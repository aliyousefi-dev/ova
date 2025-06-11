package videotools

import (
	"fmt"
	"ova-cli/source/datatypes"
)

func GetVideoMetadata(videoPath string) (datatypes.VideoMetadata, error) {
	duration, err := GetVideoDuration(videoPath)
	if err != nil {
		return datatypes.VideoMetadata{}, fmt.Errorf("failed to get duration: %w", err)
	}

	mimeType, err := GetMimeTypeForFile(videoPath)
	if err != nil {
		return datatypes.VideoMetadata{}, fmt.Errorf("failed to get MIME type: %w", err)
	}

	resolution, err := GetVideoResolution(videoPath)
	if err != nil {
		return datatypes.VideoMetadata{}, fmt.Errorf("failed to get resolution: %w", err)
	}

	return datatypes.VideoMetadata{
		Duration:   duration,
		MimeType:   mimeType,
		Resolution: resolution,
	}, nil
}
