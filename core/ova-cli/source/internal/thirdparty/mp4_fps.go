package thirdparty

import (
	"bytes"
	"fmt"
	"os/exec"
	"strconv"
	"strings"
)

// GetVideoFPS returns the FPS (frames per second) of a video.
func GetVideoFPS(videoPath string) (float64, error) {
	ffprobePath, err := GetFFprobePath()
	if err != nil {
		return 0, err
	}

	cmd := exec.Command(
		ffprobePath,
		"-v", "error",
		"-select_streams", "v:0", // Select the first video stream
		"-show_entries", "stream=r_frame_rate", // Get frame rate (FPS)
		"-of", "csv=p=0:s=x", // Output in CSV format, no headers
		videoPath,
	)

	var out bytes.Buffer
	cmd.Stdout = &out

	if err := cmd.Run(); err != nil {
		return 0, fmt.Errorf("ffprobe execution failed: %w", err)
	}

	// e.g., "30/1" or "30000/1001" for FPS
	fpsStr := strings.TrimSpace(out.String())
	fpsParts := strings.Split(fpsStr, "/")
	var fps float64

	if len(fpsParts) == 1 {
		// If the FPS is an integer, e.g., "30"
		fps, err = strconv.ParseFloat(fpsParts[0], 64)
		if err != nil {
			return 0, fmt.Errorf("invalid FPS value: %w", err)
		}
	} else if len(fpsParts) == 2 {
		// If the FPS is a fraction, e.g., "30000/1001" (for 29.97 FPS)
		num, err := strconv.Atoi(fpsParts[0])
		if err != nil {
			return 0, fmt.Errorf("invalid FPS numerator: %w", err)
		}

		denom, err := strconv.Atoi(fpsParts[1])
		if err != nil {
			return 0, fmt.Errorf("invalid FPS denominator: %w", err)
		}

		fps = float64(num) / float64(denom)
	} else {
		return 0, fmt.Errorf("unexpected FPS format: %s", fpsStr)
	}

	return fps, nil
}
