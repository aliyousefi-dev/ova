package thirdparty

import (
	"bytes"
	"fmt"
	"os/exec"
	"strconv"
	"strings"
)

// GetVideoDuration returns the duration of a video in seconds (float64, as ffprobe can return decimals).
func GetVideoDuration(videoPath string) (float64, error) {
	ffprobePath, err := GetFFprobePath()
	if err != nil {
		return 0, fmt.Errorf("failed to find ffprobe: %w", err) // More specific error message
	}

	cmd := exec.Command(
		ffprobePath,
		"-v", "error",
		"-show_entries", "format=duration",
		"-of", "default=noprint_wrappers=1:nokey=1",
		videoPath,
	)

	var out bytes.Buffer
	var stderr bytes.Buffer // Capture stderr for better error debugging
	cmd.Stdout = &out
	cmd.Stderr = &stderr // Assign stderr buffer

	if err := cmd.Run(); err != nil {
		// Include stderr output in the error message for debugging
		return 0, fmt.Errorf("ffprobe execution failed for %s: %s, error: %w", videoPath, stderr.String(), err)
	}

	durationStr := strings.TrimSpace(out.String())
	if durationStr == "" { // Handle case where ffprobe might return empty string
		return 0, fmt.Errorf("ffprobe returned empty duration for %s", videoPath)
	}

	duration, err := strconv.ParseFloat(durationStr, 64)
	if err != nil {
		return 0, fmt.Errorf("invalid duration value '%s' from ffprobe for %s: %w", durationStr, videoPath, err) // Include problematic string
	}
	return duration, nil
}
