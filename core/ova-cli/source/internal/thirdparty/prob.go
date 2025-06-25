package thirdparty

import (
	"fmt"
	"os/exec"
	"strconv"
	"strings"
)

func GetKeyframePacketTimestamps(videoPath string) ([]float64, error) {
	ffprobePath, err := GetFFprobePath()
	if err != nil {
		return nil, err
	}

	args := []string{
		"-loglevel", "error",
		"-select_streams", "v:0",
		"-show_entries", "packet=pts_time,flags",
		"-of", "csv=print_section=0",
		videoPath,
	}

	cmd := exec.Command(ffprobePath, args...)
	out, err := cmd.Output()
	if err != nil {
		return nil, fmt.Errorf("ffprobe failed: %w", err)
	}

	lines := strings.Split(strings.TrimSpace(string(out)), "\n")
	var timestamps []float64
	for _, line := range lines {
		parts := strings.Split(line, ",")
		if len(parts) != 2 {
			continue
		}
		tsStr := parts[0]
		flags := parts[1]
		if !strings.Contains(flags, "K") {
			continue
		}
		ts, err := strconv.ParseFloat(tsStr, 64)
		if err != nil {
			return nil, fmt.Errorf("failed to parse timestamp %q: %w", tsStr, err)
		}
		timestamps = append(timestamps, ts)
	}

	return timestamps, nil
}
