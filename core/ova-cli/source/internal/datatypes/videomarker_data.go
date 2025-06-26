package datatypes

import (
	"fmt"
	"strconv"
	"strings"
)

// VideoMarker represents a marker in a video.
// It stores the timestamp as Hour, Minute, and Second components.
type VideoMarker struct {
	Hour   int    `json:"hour"`
	Minute int    `json:"minute"`
	Second int    `json:"second"`
	Title  string `json:"title"`
}

// UpdateMarkersRequest defines the expected JSON payload for updating markers,
// using the VideoMarker structure for incoming data.
type UpdateMarkersRequest struct {
	Markers []VideoMarker `json:"markers"`
}

// FormatHMSToVTT converts hour, minute, second to "HH:MM:SS.000" format required by VTT.
// Milliseconds are set to 000 as they are not part of the VideoMarker struct.
func FormatHMSToVTT(h, m, s int) string {
	return fmt.Sprintf("%02d:%02d:%02d.000", h, m, s)
}

// ParseVTTToHMS parses a VTT timestamp string into hours, minutes, and seconds.
// Milliseconds are ignored as they are not used in the VideoMarker structure.
func ParseVTTToHMS(vtt string) (h, m, s int, err error) {
	partsDot := strings.Split(vtt, ".")
	timePart := partsDot[0] // e.g., "00:01:05" or "01:05" or "5"

	partsColon := strings.Split(timePart, ":")
	numParts := len(partsColon)

	switch numParts {
	case 3: // HH:MM:SS
		h, err = strconv.Atoi(partsColon[0])
		if err != nil {
			return 0, 0, 0, fmt.Errorf("invalid hour in timestamp '%s': %w", vtt, err)
		}
		m, err = strconv.Atoi(partsColon[1])
		if err != nil {
			return 0, 0, 0, fmt.Errorf("invalid minute in timestamp '%s': %w", vtt, err)
		}
		s, err = strconv.Atoi(partsColon[2])
		if err != nil {
			return 0, 0, 0, fmt.Errorf("invalid second in timestamp '%s': %w", vtt, err)
		}
	case 2: // MM:SS (assume hours are 0)
		h = 0
		m, err = strconv.Atoi(partsColon[0])
		if err != nil {
			return 0, 0, 0, fmt.Errorf("invalid minute in timestamp '%s': %w", vtt, err)
		}
		s, err = strconv.Atoi(partsColon[1])
		if err != nil {
			return 0, 0, 0, fmt.Errorf("invalid second in timestamp '%s': %w", vtt, err)
		}
	case 1: // SS (assume hours, minutes are 0)
		h, m = 0, 0
		s, err = strconv.Atoi(partsColon[0])
		if err != nil {
			return 0, 0, 0, fmt.Errorf("invalid second in timestamp '%s': %w", vtt, err)
		}
	default:
		return 0, 0, 0, fmt.Errorf("invalid time part format in timestamp: %s", vtt)
	}

	return h, m, s, nil
}

// ConvertToSeconds converts VideoMarker (H,M,S) to total seconds (float64).
func (vm *VideoMarker) ConvertToSeconds() float64 {
	return float64(vm.Hour*3600 + vm.Minute*60 + vm.Second)
}
