package thirdparty

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

// GenerateImageFromVideo uses FFmpeg to create a image at a specific time position (in seconds).
func GenerateImageFromVideo(videoPath, outputImagePath string, timePos float64) error {
	ffmpegPath, err := GetFFmpegPath()
	if err != nil {
		return fmt.Errorf("ffmpeg path error: %w", err)
	}

	if timePos < 0 {
		timePos = 0
	}
	timePosStr := fmt.Sprintf("%.2f", timePos)

	dir := filepath.Dir(outputImagePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}

	cmd := exec.Command(
		ffmpegPath,
		"-y",
		"-ss", timePosStr,
		"-i", videoPath,
		"-frames:v", "1",
		"-q:v", "2",
		"-vf", "scale=320:-1",
		"-pix_fmt", "yuvj420p",
		"-f", "image2",
		outputImagePath,
	)

	output, err := cmd.CombinedOutput()
	outputStr := string(output)

	// Clean error if FFmpeg fails with empty output (likely due to overshoot)
	if strings.Contains(outputStr, "Output file is empty") || strings.Contains(outputStr, "nothing was encoded") {
		return fmt.Errorf("thumbnail time exceeds video duration")
	}

	if err != nil {
		return fmt.Errorf("ffmpeg error: %v, output: %s", err, outputStr)
	}

	// Verify output file
	if _, err := os.Stat(outputImagePath); os.IsNotExist(err) {
		return fmt.Errorf("thumbnail file was not created: %s", outputImagePath)
	}

	return nil
}
