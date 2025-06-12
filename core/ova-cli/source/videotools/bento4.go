package videotools

import (
	"fmt"
	"os"
	"path/filepath"
	"runtime"
)

// GetMP4InfoPath returns the path to mp4info executable.
func GetMP4InfoPath() (string, error) {
	return getBentoToolPath("mp4info")
}

// Helper function for resolving Bento4 tool paths
func getBentoToolPath(toolName string) (string, error) {
	exePath, err := os.Executable()
	if err != nil {
		return "", fmt.Errorf("failed to get executable path: %w", err)
	}
	exeDir := filepath.Dir(exePath)

	toolPath := filepath.Join(exeDir, "bento4", toolName)
	if runtime.GOOS == "windows" {
		toolPath += ".exe"
	}

	info, err := os.Stat(toolPath)
	if err != nil {
		if os.IsNotExist(err) {
			return "", fmt.Errorf("%s not found: %s", toolName, toolPath)
		}
		return "", fmt.Errorf("error checking %s: %w", toolName, err)
	}
	if info.IsDir() {
		return "", fmt.Errorf("%s path is a directory: %s", toolName, toolPath)
	}
	return toolPath, nil
}
