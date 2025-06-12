package videotools

import (
	"fmt"
	"os/exec"
)

// PrintMP4Info runs mp4info on the provided video path and prints the output.
func GetMP4Info(videoPath string) (string, error) {
	mp4infoPath, err := GetMP4InfoPath()
	if err != nil {
		return "", fmt.Errorf("could not resolve mp4info path: %w", err)
	}

	cmd := exec.Command(mp4infoPath, videoPath)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("mp4info execution failed: %w\nOutput: %s", err, string(output))
	}

	return string(output), nil
}
