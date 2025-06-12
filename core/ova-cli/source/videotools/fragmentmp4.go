package videotools

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
)

// ConvertMP4ToFragmentedMP4InPlace converts a standard MP4 to a fragmented MP4 file,
// safely overwriting the input file by writing to a temp file first.
func ConvertMP4ToFragmentedMP4InPlace(filePath string) error {
	ffmpegPath, err := GetFFmpegPath()
	if err != nil {
		return fmt.Errorf("failed to get ffmpeg path: %w", err)
	}

	dir := filepath.Dir(filePath)
	tmpFile := filepath.Join(dir, filepath.Base(filePath)+".tmpfrag.mp4")

	// Ensure output directory exists (probably redundant here but safe)
	if err := os.MkdirAll(dir, os.ModePerm); err != nil {
		return fmt.Errorf("failed to create output directory: %w", err)
	}

	cmd := exec.Command(
		ffmpegPath,
		"-i", filePath,
		"-c", "copy",
		"-movflags", "+frag_keyframe+empty_moov",
		tmpFile,
	)

	// Suppress output unless error occurs
	cmd.Stdout = nil
	cmd.Stderr = nil

	if err := cmd.Run(); err != nil {
		return fmt.Errorf("ffmpeg fragmenting failed: %w", err)
	}

	// Replace original file with temp fragmented file
	if err := os.Rename(tmpFile, filePath); err != nil {
		return fmt.Errorf("failed to replace original file: %w", err)
	}

	return nil
}
