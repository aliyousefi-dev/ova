package videotools

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
)

// GenerateThumbnail uses FFmpeg to create a thumbnail at a specific time position (in seconds).
func GenerateThumbnail(videoPath, thumbnailPath string, timePos float64) error {
	ffmpegPath, err := GetFFmpegPath()
	if err != nil {
		fmt.Printf("FFmpeg path error: %v\n", err)
		return err
	}

	if timePos < 0 {
		timePos = 0
	}
	timePosStr := fmt.Sprintf("%.2f", timePos)

	dir := filepath.Dir(thumbnailPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		fmt.Printf("Failed to create thumbnail directory '%s': %v\n", dir, err)
		return fmt.Errorf("failed to create directory: %w", err)
	}

	cmd := exec.Command(
		ffmpegPath,
		"-ss", timePosStr,
		"-i", videoPath,
		"-frames:v", "1",
		"-q:v", "2",
		"-vf", "scale=320:-1",
		"-pix_fmt", "yuvj420p",
		"-f", "image2",
		thumbnailPath,
	)

	output, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Printf("Thumbnail error for '%s': %v\nOutput: %s\n", videoPath, err, string(output))
		return fmt.Errorf("ffmpeg error: %v, output: %s", err, string(output))
	}

	return nil
}
