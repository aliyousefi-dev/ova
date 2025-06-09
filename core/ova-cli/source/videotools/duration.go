package videotools

import (
	"bytes"
	"fmt"
	"os/exec"
	"strconv"
	"strings"
)

// GetVideoDuration returns the duration of a video in seconds.
func GetVideoDuration(videoPath string) (float64, error) {
	ffprobePath, err := GetFFprobePath()
	if err != nil {
		return 0, err
	}

	cmd := exec.Command(
		ffprobePath,
		"-v", "error",
		"-show_entries", "format=duration",
		"-of", "default=noprint_wrappers=1:nokey=1",
		videoPath,
	)

	var out bytes.Buffer
	cmd.Stdout = &out

	if err := cmd.Run(); err != nil {
		return 0, fmt.Errorf("ffprobe execution failed: %w", err)
	}

	durationStr := strings.TrimSpace(out.String())
	duration, err := strconv.ParseFloat(durationStr, 64)
	if err != nil {
		return 0, fmt.Errorf("invalid duration value: %w", err)
	}
	return duration, nil
}
