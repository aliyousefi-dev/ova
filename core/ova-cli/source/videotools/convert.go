package videotools

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
)

// ConvertToMP4 remuxes a video file (e.g., .ts) into an MP4 container without re-encoding
func ConvertToMP4(inputPath, outputPath string) error {
	ffmpegPath, err := GetFFmpegPath()
	if err != nil {
		return err
	}

	dir := filepath.Dir(outputPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}

	cmd := exec.Command(
		ffmpegPath,
		"-i", inputPath,
		"-c", "copy", // remux video/audio as-is
		"-movflags", "+faststart", // optional: for web streaming
		outputPath,
	)

	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("ffmpeg conversion error: %v, output: %s", err, string(output))
	}

	return nil
}
