package repo

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
	"ova-cli/source/internal/filehash"
	"ova-cli/source/internal/thirdparty"
)

// GenerateVideoID computes a unique ID for the video based on its content hash.
func (r *RepoManager) GenerateVideoID(absoluteVideoPath string) (string, error) {
	videoID, err := filehash.ComputeFileHash(absoluteVideoPath)
	if err != nil {
		return "", fmt.Errorf("filehash compute failed for %s: %w", absoluteVideoPath, err)
	}
	return videoID, nil
}

// GetVideoDuration returns the duration (in seconds) of the given video file.
func (r *RepoManager) GetVideoDuration(videoPath string) (float64, error) {
	duration, err := thirdparty.GetVideoDuration(videoPath)
	if err != nil {
		return 0, fmt.Errorf("failed to get duration for %s: %w", videoPath, err)
	}
	return duration, nil
}

// GetVideoDuration returns the duration (in seconds) of the given video file.
func (r *RepoManager) GetVideoCodect(videoPath string) (datatypes.VideoCodecs, error) {

	codec, err := thirdparty.GetCodecsForFile(videoPath)
	if err != nil {
		return datatypes.VideoCodecs{}, fmt.Errorf("failed to get codecs for file: %w", err)
	}

	return codec, nil
}

// GetVideoResolution returns the resolution of the given video file.
func (r *RepoManager) GetVideoResolution(videoPath string) (datatypes.VideoResolution, error) {
	resolution, err := thirdparty.GetVideoResolution(videoPath)
	if err != nil {
		return datatypes.VideoResolution{}, fmt.Errorf("failed to get resolution for %s: %w", videoPath, err)
	}
	return resolution, nil
}
