package thirdparty

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

// IsFragmentedMP4 checks if the given MP4 file is a fragmented MP4 (fMP4).
func IsFragmentedMP4(videoPath string) (bool, error) {
	mp4infoPath, err := GetBentoMP4InfoPath()
	if err != nil {
		return false, err
	}

	cmd := exec.Command(mp4infoPath, videoPath)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return false, err
	}

	lines := strings.Split(string(output), "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if strings.HasPrefix(line, "fragments:") {
			return strings.Contains(line, "yes"), nil
		}
	}
	return false, nil
}

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

// ConvertFragmentedMP4ToUnfragmentedMP4InPlace converts a fragmented MP4 (fMP4) to a standard MP4,
// safely overwriting the input file by writing to a temp file first.
func ConvertFragmentedMP4ToUnfragmentedMP4InPlace(filePath string) error {
	ffmpegPath, err := GetFFmpegPath()
	if err != nil {
		return fmt.Errorf("failed to get ffmpeg path: %w", err)
	}

	dir := filepath.Dir(filePath)
	tmpFile := filepath.Join(dir, filepath.Base(filePath)+".tmpunfrag.mp4")

	// Ensure output directory exists
	if err := os.MkdirAll(dir, os.ModePerm); err != nil {
		return fmt.Errorf("failed to create output directory: %w", err)
	}

	cmd := exec.Command(
		ffmpegPath,
		"-i", filePath,
		"-c", "copy",
		"-movflags", "+faststart", // Remove fragment flags, optimize for web
		tmpFile,
	)

	cmd.Stdout = nil
	cmd.Stderr = nil

	if err := cmd.Run(); err != nil {
		return fmt.Errorf("ffmpeg unfragmenting failed: %w", err)
	}

	// Replace original file with temp unfragmented file
	if err := os.Rename(tmpFile, filePath); err != nil {
		return fmt.Errorf("failed to replace original file: %w", err)
	}

	return nil
}
