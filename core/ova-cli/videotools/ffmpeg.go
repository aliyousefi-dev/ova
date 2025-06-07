package videotools

import (
	"fmt"
	"os"
	"path/filepath"
	"runtime"
)

// GetFFmpegPath returns the path to the ffmpeg executable.
func GetFFmpegPath() (string, error) {
	exePath, err := os.Executable()
	if err != nil {
		return "", fmt.Errorf("failed to get executable path: %w", err)
	}
	exeDir := filepath.Dir(exePath)

	ffmpegPath := filepath.Join(exeDir, "ffmpeg", "ffmpeg")
	if runtime.GOOS == "windows" {
		ffmpegPath += ".exe"
	}

	info, err := os.Stat(ffmpegPath)
	if err != nil {
		if os.IsNotExist(err) {
			return "", fmt.Errorf("ffmpeg not found: %s", ffmpegPath)
		}
		return "", fmt.Errorf("error checking ffmpeg: %w", err)
	}
	if info.IsDir() {
		return "", fmt.Errorf("ffmpeg path is a directory: %s", ffmpegPath)
	}
	return ffmpegPath, nil
}

// GetFFprobePath returns the path to the ffprobe executable.
func GetFFprobePath() (string, error) {
	exePath, err := os.Executable()
	if err != nil {
		return "", fmt.Errorf("failed to get executable path: %w", err)
	}
	exeDir := filepath.Dir(exePath)

	ffprobePath := filepath.Join(exeDir, "ffmpeg", "ffprobe")
	if runtime.GOOS == "windows" {
		ffprobePath += ".exe"
	}

	info, err := os.Stat(ffprobePath)
	if err != nil {
		if os.IsNotExist(err) {
			return "", fmt.Errorf("ffprobe not found: %s", ffprobePath)
		}
		return "", fmt.Errorf("error checking ffprobe: %w", err)
	}
	if info.IsDir() {
		return "", fmt.Errorf("ffprobe path is a directory: %s", ffprobePath)
	}
	return ffprobePath, nil
}
