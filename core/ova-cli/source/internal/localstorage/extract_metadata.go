package localstorage

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
	"ova-cli/source/internal/thirdparty"
)

func extractVideoMetadata(videoPath string) (datatypes.VideoMetadata, error) {
	duration, err := thirdparty.GetVideoDuration(videoPath)
	if err != nil {
		return datatypes.VideoMetadata{}, fmt.Errorf("failed to get duration: %w", err)
	}

	mimeType, err := thirdparty.GetCodecsForFile(videoPath) // Assuming GetCodecsForFile returns datatypes.Codecs
	if err != nil {
		return datatypes.VideoMetadata{}, fmt.Errorf("failed to get codecs for file: %w", err) // Changed error message
	}

	resolution, err := thirdparty.GetVideoResolution(videoPath)
	if err != nil {
		return datatypes.VideoMetadata{}, fmt.Errorf("failed to get resolution: %w", err)
	}

	// Important: Align with the updated datatypes.VideoMetadata struct
	return datatypes.VideoMetadata{
		Duration:   int(duration), // Cast float64 to int
		MimeType:   mimeType,
		Resolution: resolution,
	}, nil
}
