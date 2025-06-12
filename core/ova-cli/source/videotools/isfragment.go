package videotools

import (
	"os/exec"
	"strings"
)

// IsFragmentedMP4 checks if the given MP4 file is a fragmented MP4 (fMP4).
func IsFragmentedMP4(videoPath string) (bool, error) {
	mp4infoPath, err := GetMP4InfoPath()
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
