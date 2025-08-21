package thirdparty

import (
	"bytes"
	"encoding/json"
	"fmt"
	"math"
	"os/exec"
	"path"
)

// VideoResolution defines the width and height of a video.
type VideoResolution struct {
	Width  int `json:"width"`
	Height int `json:"height"`
}

// VideoDetails represents the details of a video file.
type VideoDetails struct {
	Format      string          `json:"format"`      // Video File Extension
	DurationSec int             `json:"durationSec"` // Video duration in seconds
	FrameRate   float64         `json:"frameRate"`   // Frames per second
	IsFragment  bool            `json:"isFragment"`  // Check if it's fragmented or not
	Resolution  VideoResolution `json:"resolution"`  // Resolution (width x height)
	VideoCodec  string          `json:"videoCodec"`  // Video codec (e.g., avc1.640032)
	AudioCodec  string          `json:"audioCodec"`  // Audio codec (e.g., mp4a.40.2)
}

// GetVideoDetails returns a struct containing the duration, FPS, resolution, and codec details of a video.
func GetVideoDetails(videoPath string) (VideoDetails, error) {

	// Extract file extension (e.g., .mp4)
	ext := path.Ext(videoPath)

	// Get the full path to the Bento4 mp4info executable
	mp4infoPath, err := GetBentoMP4InfoPath()
	if err != nil {
		return VideoDetails{}, fmt.Errorf("could not resolve mp4info path: %w", err)
	}

	// Run mp4info with the --fast option to get details in JSON format
	cmd := exec.Command(
		mp4infoPath,
		"--fast",           // Using the fast option for quicker analysis
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
	width, widthOk := videoTrack["display_width"].(float64)
	height, heightOk := videoTrack["display_height"].(float64)

	// Ensure width and height exist and are valid numbers
	if !widthOk || !heightOk {
		return VideoDetails{}, fmt.Errorf("missing or invalid width/height in video track")
	}

	// Check for 'duration_ms' safely and handle the case where it might be missing or nil
	var duration float64
	if movie, ok := result["movie"].(map[string]interface{}); ok {
		if durationStr, ok := movie["duration_ms"].(float64); ok {
			duration = durationStr / 1000 // Convert from milliseconds to seconds
		} else {
			return VideoDetails{}, fmt.Errorf("'duration_ms' is missing or not a float64")
		}
	} else {
		return VideoDetails{}, fmt.Errorf("'movie' field is missing or not a map")
	}

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

	// Get FPS using GetVideoFPS function
	fps, err := GetVideoFPS(videoPath)
	if err != nil {
		return VideoDetails{}, fmt.Errorf("failed to get video FPS: %w", err)
	}

	// Limit FPS to 2 decimal places
	fps = math.Round(fps*100) / 100 // This rounds the FPS to 2 decimal places

	// Check if the video is fragmented
	isFragment := false
	if movie, ok := result["movie"].(map[string]interface{}); ok {
		if fragments, ok := movie["fragments"].(bool); ok {
			isFragment = fragments
		} else {
			// If fragments is not found or isn't a bool, assume it's not fragmented
			isFragment = false
		}
	} else {
		return VideoDetails{}, fmt.Errorf("'movie' field is missing or not a map")
	}

	// Return the results in a struct with the file extension and other details
	return VideoDetails{
		Format:      ext,           // Include the file extension (e.g., ".mp4")
		DurationSec: int(duration), // Cast duration to int
		FrameRate:   fps,           // Use the frame rate directly
		IsFragment:  isFragment,    // Check if the video is fragmented
		Resolution:  VideoResolution{Width: int(width), Height: int(height)},
		VideoCodec:  videoCodec,
		AudioCodec:  audioCodec,
	}, nil
}
