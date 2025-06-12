package videotools

import (
	"fmt"
	"ova-cli/source/datatypes"
	"regexp"
)

// GetMimeTypeForFile uses Bento4's mp4info to extract codec info and return a Codecs struct
func GetCodecsForFile(filePath string) (datatypes.Codecs, error) {
	infoText, err := GetMP4Info(filePath)
	if err != nil {
		return datatypes.Codecs{}, err
	}

	// Regex to capture codec strings from the mp4info output
	videoCodecRe := regexp.MustCompile(`(?m)^    Codec String: (avc1\.[0-9A-Fa-f]+)`)
	audioCodecRe := regexp.MustCompile(`(?m)^    Codec String: (mp4a\.\d+\.\d+)`)

	var videoCodec, audioCodec string

	if match := videoCodecRe.FindStringSubmatch(infoText); match != nil {
		videoCodec = match[1]
	}
	if match := audioCodecRe.FindStringSubmatch(infoText); match != nil {
		audioCodec = match[1]
	}

	if videoCodec == "" && audioCodec == "" {
		return datatypes.Codecs{}, fmt.Errorf("no supported video/audio codec found in mp4info output")
	}

	return datatypes.Codecs{
		Format: "video/mp4", // hardcoded container format since using mp4info
		Video:  videoCodec,
		Audio:  audioCodec,
	}, nil
}
