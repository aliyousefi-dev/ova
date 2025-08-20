package thirdparty

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os/exec"
)

// VideoResolution defines the width and height of a video.
type VideoResolution struct {
	Width  int `json:"width"`
	Height int `json:"height"`
}

// VideoDetails represents the details of a video file.
type VideoDetails struct {
	Duration   float64         `json:"duration"`    // Video duration in seconds
	FPS        float64         `json:"fps"`         // Frames per second
	Resolution VideoResolution `json:"resolution"`  // Resolution (width x height)
	VideoCodec string          `json:"video_codec"` // Video codec (e.g., avc1.640032)
	AudioCodec string          `json:"audio_codec"` // Audio codec (e.g., mp4a.40.2)
	BitRate    int             `json:"bit_rate"`    // Bit rate in bits per second
}

// GetVideoDetails returns a struct containing the duration, FPS, resolution, and bit rate of a video.
func GetVideoDetails(videoPath string) (VideoDetails, error) {
	// Get the full path to the Bento4 mp4info executable
	mp4infoPath, err := GetBentoMP4InfoPath()
	if err != nil {
		return VideoDetails{}, fmt.Errorf("could not resolve mp4info path: %w", err)
	}

	// Run mp4info to get details in JSON format
	cmd := exec.Command(
		mp4infoPath,
		"--format", "json", // Requesting JSON format
		videoPath,
	)

	var out bytes.Buffer
	cmd.Stdout = &out
	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		return VideoDetails{}, fmt.Errorf("mp4info execution failed: %s, error: %w", stderr.String(), err)
	}

	// Parse mp4info JSON output
	var result map[string]interface{}
	err = json.Unmarshal(out.Bytes(), &result)
	if err != nil {
		return VideoDetails{}, fmt.Errorf("failed to parse mp4info output: %w", err)
	}

	// Extract the relevant details from the JSON output
	tracks, ok := result["tracks"].([]interface{})
	if !ok || len(tracks) == 0 {
		return VideoDetails{}, fmt.Errorf("no tracks found in mp4info output")
	}

	// Get the first video track (assuming track 1 is always video)
	videoTrack, ok := tracks[0].(map[string]interface{})
	if !ok {
		return VideoDetails{}, fmt.Errorf("invalid video track format")
	}

	// Parse the details from the video track
	width := int(videoTrack["display_width"].(float64))
	height := int(videoTrack["display_height"].(float64))

	// Parse FPS (frame_rate)
	frameRateStr := videoTrack["frame_rate"].(float64)
	fps := frameRateStr

	// Parse duration (convert to float64)
	durationStr := result["movie"].(map[string]interface{})["duration_ms"].(float64)
	duration := durationStr / 1000 // Convert from milliseconds to seconds

	// Parse bit rate (from video track)
	bitRateStr := videoTrack["media"].(map[string]interface{})["bitrate"].(float64)
	bitRate := int(bitRateStr * 1000) // Convert from Kbps to bps

	// Parse video codec
	videoCodec := ""
	if len(videoTrack["sample_descriptions"].([]interface{})) > 0 {
		videoCodec = videoTrack["sample_descriptions"].([]interface{})[0].(map[string]interface{})["codecs_string"].(string)
	}

	// Parse audio codec (from the second track, assuming track 2 is always audio)
	audioCodec := ""
	if len(tracks) > 1 {
		audioTrack, ok := tracks[1].(map[string]interface{})
		if ok {
			if len(audioTrack["sample_descriptions"].([]interface{})) > 0 {
				audioCodec = audioTrack["sample_descriptions"].([]interface{})[0].(map[string]interface{})["codecs_string"].(string)
			}
		}
	}

	// Return the results in a struct
	return VideoDetails{
		Duration:   duration,
		FPS:        fps,
		Resolution: VideoResolution{Width: width, Height: height},
		BitRate:    bitRate,
		VideoCodec: videoCodec,
		AudioCodec: audioCodec,
	}, nil
}
