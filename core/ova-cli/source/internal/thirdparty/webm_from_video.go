package thirdparty

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
)

// GenerateWebMFromVideo generates a short webm preview from a given video
func GenerateWebMFromVideo(videoPath, outputPath string, startTime float64, duration float64) error {
	ffmpegPath, err := GetFFmpegPath()
	if err != nil {
		return err
	}

	if startTime < 0 {
		startTime = 0
	}

	dir := filepath.Dir(outputPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}

	cmd := exec.Command(
		ffmpegPath,
		"-ss", fmt.Sprintf("%.2f", startTime),
		"-i", videoPath,
		"-t", fmt.Sprintf("%.2f", duration),
		"-an",
		"-vf", "scale=320:-1",
		"-c:v", "libvpx",
		"-quality", "realtime",
		"-cpu-used", "7",
		"-threads", "2", // 0 = auto threads
		"-b:v", "500K",
		outputPath,
	)

	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("ffmpeg error: %v, output: %s", err, string(output))
	}

	return nil
}
