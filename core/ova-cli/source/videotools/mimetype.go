package videotools

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"os/exec"
	"strings"
)

type FFProbeStream struct {
	CodecName string `json:"codec_name"`
	CodecType string `json:"codec_type"`
	Profile   string `json:"profile,omitempty"`
}

type FFProbeOutput struct {
	Streams []FFProbeStream `json:"streams"`
}

// GetMimeTypeForFile uses ffprobe to analyze the file and returns
// a MIME type string including codecs (for mp4/h264 etc)
func GetMimeTypeForFile(filePath string) (string, error) {
	ffprobePath, err := GetFFprobePath()
	if err != nil {
		return "", err
	}

	cmd := exec.Command(
		ffprobePath,
		"-v", "error",
		"-print_format", "json",
		"-show_streams",
		filePath,
	)

	var out bytes.Buffer
	cmd.Stdout = &out

	if err := cmd.Run(); err != nil {
		return "", fmt.Errorf("ffprobe execution failed: %w", err)
	}

	var probeOutput FFProbeOutput
	if err := json.Unmarshal(out.Bytes(), &probeOutput); err != nil {
		return "", fmt.Errorf("failed to parse ffprobe output: %w", err)
	}

	// Find video and audio codec strings
	var videoCodec, audioCodec string
	for _, stream := range probeOutput.Streams {
		switch stream.CodecType {
		case "video":
			videoCodec = stream.CodecName
		case "audio":
			audioCodec = stream.CodecName
		}
	}

	if videoCodec == "" {
		return "", errors.New("could not determine video codec")
	}

	// Build MIME type string - this example is for mp4 container & common codecs
	// You can improve this logic to cover other containers/codecs
	codecStrs := []string{}

	switch videoCodec {
	case "h264":
		codecStrs = append(codecStrs, "avc1.42E01E") // baseline profile example
	case "hevc":
		codecStrs = append(codecStrs, "hev1.1.6.L93.B0")
	default:
		codecStrs = append(codecStrs, videoCodec)
	}

	if audioCodec == "aac" {
		codecStrs = append(codecStrs, "mp4a.40.2")
	} else if audioCodec != "" {
		codecStrs = append(codecStrs, audioCodec)
	}

	mimeType := fmt.Sprintf(`video/mp4; codecs="%s"`, strings.Join(codecStrs, ", "))
	return mimeType, nil
}
