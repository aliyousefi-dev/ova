package videotools

import (
	"bytes"
	"fmt"
	"os/exec"
	"strconv"
	"strings"
)

// VideoResolution holds width and height info
type VideoResolution struct {
	Width  int
	Height int
}

// GetVideoResolution returns the width and height of a video.
func GetVideoResolution(videoPath string) (VideoResolution, error) {
	ffprobePath, err := GetFFprobePath()
	if err != nil {
		return VideoResolution{}, err
	}

	cmd := exec.Command(
		ffprobePath,
		"-v", "error",
		"-select_streams", "v:0",
		"-show_entries", "stream=width,height",
		"-of", "csv=p=0:s=x",
		videoPath,
	)

	var out bytes.Buffer
	cmd.Stdout = &out

	if err := cmd.Run(); err != nil {
		return VideoResolution{}, fmt.Errorf("ffprobe execution failed: %w", err)
	}

	resolutionStr := strings.TrimSpace(out.String()) // e.g. "1920x1080"
	parts := strings.Split(resolutionStr, "x")
	if len(parts) != 2 {
		return VideoResolution{}, fmt.Errorf("unexpected resolution format: %s", resolutionStr)
	}

	width, err := strconv.Atoi(parts[0])
	if err != nil {
		return VideoResolution{}, fmt.Errorf("invalid width value: %w", err)
	}

	height, err := strconv.Atoi(parts[1])
	if err != nil {
		return VideoResolution{}, fmt.Errorf("invalid height value: %w", err)
	}

	return VideoResolution{Width: width, Height: height}, nil
}
