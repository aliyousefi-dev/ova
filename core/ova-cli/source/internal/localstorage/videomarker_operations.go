package localstorage

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"

	"ova-cli/source/internal/datatypes"
)

// ensureMarkersDir creates the directory for storing VTT marker files if it doesn't exist.
func (s *LocalStorage) ensureMarkersDir() error {
	dir := filepath.Join(s.GetStoragePath(), "video_markers")
	return os.MkdirAll(dir, 0755)
}

// formatSecondsToTimestamp converts seconds (float64) to "HH:MM:SS.mmm" format required by VTT.
func formatSecondsToTimestamp(seconds float64) string {
	if seconds < 0 {
		seconds = 0
	}
	d := time.Duration(seconds * float64(time.Second))
	h := int(d.Hours())
	m := int(d.Minutes()) % 60
	s := int(d.Seconds()) % 60
	ms := int(d.Milliseconds()) % 1000
	return fmt.Sprintf("%02d:%02d:%02d.%03d", h, m, s, ms)
}

// parseTimestampToSeconds parses a VTT timestamp string into seconds.
func parseTimestampToSeconds(ts string) (float64, error) {
	partsDot := strings.Split(ts, ".")
	if len(partsDot) != 2 {
		return 0, fmt.Errorf("invalid timestamp format (missing milliseconds): %s", ts)
	}

	timeStr := partsDot[0]
	milliStr := partsDot[1]

	milliseconds, err := strconv.Atoi(milliStr)
	if err != nil {
		return 0, fmt.Errorf("invalid milliseconds in timestamp: %s", ts)
	}
	totalSeconds := float64(milliseconds) / 1000.0

	partsColon := strings.Split(timeStr, ":")
	numParts := len(partsColon)
	if numParts < 1 || numParts > 3 {
		return 0, fmt.Errorf("invalid time part format in timestamp: %s", ts)
	}

	seconds, err := strconv.Atoi(partsColon[numParts-1])
	if err != nil {
		return 0, err
	}
	totalSeconds += float64(seconds)

	if numParts >= 2 {
		minutes, err := strconv.Atoi(partsColon[numParts-2])
		if err != nil {
			return 0, err
		}
		totalSeconds += float64(minutes * 60)
	}

	if numParts == 3 {
		hours, err := strconv.Atoi(partsColon[numParts-3])
		if err != nil {
			return 0, err
		}
		totalSeconds += float64(hours * 3600)
	}

	return totalSeconds, nil
}

// AddMarkerToVideo adds a marker to the video marker list stored in VTT.
func (s *LocalStorage) AddMarkerToVideo(videoID string, marker datatypes.VideoMarker) error {
	markers, err := s.GetMarkersForVideo(videoID)
	if err != nil {
		return err
	}

	markers = append(markers, marker)

	return s.saveMarkersToVTT(videoID, markers)
}

// GetMarkersForVideo loads markers from the VTT file.
func (s *LocalStorage) GetMarkersForVideo(videoID string) ([]datatypes.VideoMarker, error) {
	filePath := filepath.Join(s.GetStoragePath(), "video_markers", videoID+".vtt")
	data, err := os.ReadFile(filePath)
	if err != nil {
		if os.IsNotExist(err) {
			return []datatypes.VideoMarker{}, nil
		}
		return nil, err
	}

	content := string(data)
	lines := strings.Split(content, "\n")

	var markers []datatypes.VideoMarker
	state := 0
	var currentStart float64
	var currentTitle string

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}

		switch state {
		case 0:
			if line == "WEBVTT" {
				state = 1
				continue
			} else {
				return nil, fmt.Errorf("invalid VTT file: missing WEBVTT header")
			}
		case 1:
			if strings.Contains(line, "-->") {
				parts := strings.Split(line, " --> ")
				if len(parts) != 2 {
					return nil, fmt.Errorf("invalid cue timing: %s", line)
				}
				startSeconds, err := parseTimestampToSeconds(parts[0])
				if err != nil {
					return nil, err
				}
				currentStart = startSeconds
				state = 2
			} else {
				continue // skip cue id or other lines
			}
		case 2:
			currentTitle = line
			markers = append(markers, datatypes.VideoMarker{
				Timestamp: currentStart,
				Title:     currentTitle,
			})
			state = 1
		}
	}

	return markers, nil
}

// DeleteMarkerFromVideo deletes the first marker matching the exact timestamp and title.
func (s *LocalStorage) DeleteMarkerFromVideo(videoID string, marker datatypes.VideoMarker) error {
	markers, err := s.GetMarkersForVideo(videoID)
	if err != nil {
		return err
	}

	filtered := make([]datatypes.VideoMarker, 0, len(markers))
	for _, m := range markers {
		if m.Timestamp != marker.Timestamp || m.Title != marker.Title {
			filtered = append(filtered, m)
		}
	}

	return s.saveMarkersToVTT(videoID, filtered)
}

// DeleteAllMarkersFromVideo deletes all markers for a video.
func (s *LocalStorage) DeleteAllMarkersFromVideo(videoID string) error {
	filePath := filepath.Join(s.GetStoragePath(), "video_markers", videoID+".vtt")
	if err := os.Remove(filePath); err != nil && !os.IsNotExist(err) {
		return err
	}
	return nil
}

// saveMarkersToVTT writes markers to VTT file with 20 seconds duration cues.
func (s *LocalStorage) saveMarkersToVTT(videoID string, markers []datatypes.VideoMarker) error {
	if err := s.ensureMarkersDir(); err != nil {
		return err
	}

	sort.Slice(markers, func(i, j int) bool {
		return markers[i].Timestamp < markers[j].Timestamp
	})

	filePath := filepath.Join(s.GetStoragePath(), "video_markers", videoID+".vtt")

	var sb strings.Builder
	sb.WriteString("WEBVTT\n\n")

	for _, marker := range markers {
		start := marker.Timestamp
		end := start + 20.0 // 20 sec duration
		startTimestamp := formatSecondsToTimestamp(start)
		endTimestamp := formatSecondsToTimestamp(end)

		sb.WriteString(fmt.Sprintf("%s --> %s\n", startTimestamp, endTimestamp))
		sb.WriteString(marker.Title + "\n\n")
	}

	return os.WriteFile(filePath, []byte(sb.String()), 0644)
}
