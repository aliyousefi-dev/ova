package localstorage

import (
	"fmt"
	"os"
	"path/filepath"
	"sort" // Import sort package
	"strconv"
	"strings"
	"time"

	"ova-cli/source/internal/datatypes"
)

// ensureChaptersDir creates the directory for storing VTT chapter files if it doesn't exist.
func (s *LocalStorage) ensureChaptersDir() error {
	dir := s.GetVideoChaptersDir()
	return os.MkdirAll(dir, 0755)
}

// formatSecondsToTimestamp converts seconds (float64) to "HH:MM:SS.mmm" format required by VTT.
// It ensures non-negative seconds for correct formatting.
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

// UpdateVttChapters updates or creates the VTT chapter file for a given video ID.
// It ensures that the chapters are sorted by StartTime and generates a valid VTT file.
func (s *LocalStorage) UpdateVttChapters(videoID string, chapters []datatypes.VttChapter) error {
	if err := s.ensureChaptersDir(); err != nil {
		return err
	}

	filePath := filepath.Join(s.GetVideoChaptersDir(), videoID+".vtt")

	// Sort chapters by StartTime to ensure correct chronological order in VTT file.
	// This helps prevent "start > end" issues in VTT cues.
	sort.Slice(chapters, func(i, j int) bool {
		return chapters[i].StartTime < chapters[j].StartTime
	})

	var sb strings.Builder
	sb.WriteString("WEBVTT\n\n") // VTT header

	for i, ch := range chapters {
		startTimestamp := formatSecondsToTimestamp(ch.StartTime)

		var endTimestamp string
		if i+1 < len(chapters) {
			// The end time of the current chapter is the start time of the next chapter.
			endTimestamp = formatSecondsToTimestamp(chapters[i+1].StartTime)
		} else {
			// For the last chapter, assign an arbitrary duration (e.g., 10 seconds)
			// to ensure a valid VTT cue, as its end time is not defined by a subsequent chapter.
			endTimestamp = formatSecondsToTimestamp(ch.StartTime + 10.0)
		}

		// Write chapter cue: timing then title.
		// A cue identifier (e.g., "1", "2") could be added here, but is often omitted for chapter tracks.
		sb.WriteString(fmt.Sprintf("%s --> %s\n", startTimestamp, endTimestamp))
		sb.WriteString(ch.Title + "\n\n")
	}

	// Write the generated VTT content to the file (overwriting existing file).
	return os.WriteFile(filePath, []byte(sb.String()), 0644)
}

// GetVttChapters retrieves VTT chapters for a given video ID by parsing its VTT file.
// It returns an empty slice if the file does not exist, without an error.
func (s *LocalStorage) GetVttChapters(videoID string) ([]datatypes.VttChapter, error) {
	filePath := filepath.Join(s.GetVideoChaptersDir(), videoID+".vtt")

	data, err := os.ReadFile(filePath)
	if err != nil {
		if os.IsNotExist(err) {
			// If the file doesn't exist, return an empty chapters slice.
			return []datatypes.VttChapter{}, nil
		}
		return nil, err
	}

	content := string(data)
	lines := strings.Split(content, "\n")

	var chapters []datatypes.VttChapter
	var currentStart float64
	var currentTitle string
	state := 0 // 0 = expect header, 1 = expect cue timing/identifier, 2 = expect title

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" { // Skip empty lines at any point in the parsing process
			continue
		}

		if state == 0 {
			// Expect "WEBVTT" header as the first non-empty line.
			if line == "WEBVTT" {
				state = 1 // Transition to state to find cue timings
				continue
			} else {
				return nil, fmt.Errorf("invalid VTT file: missing WEBVTT header or unexpected content before it")
			}
		} else if state == 1 {
			// Expect cue timing line (e.g., "00:00:00.000 --> 00:01:30.000").
			// This state also handles optional cue identifiers by simply skipping them if they don't contain "-->".
			if strings.Contains(line, "-->") {
				parts := strings.Split(line, " --> ")
				if len(parts) < 2 {
					return nil, fmt.Errorf("invalid cue timing line format: %s", line)
				}
				startTimeStr := parts[0]

				startSeconds, err := parseTimestampToSeconds(startTimeStr)
				if err != nil {
					return nil, err
				}
				currentStart = startSeconds
				state = 2 // Next expected line is the chapter title
			} else {
				// If the line doesn't contain "-->", assume it's a cue identifier and skip it.
				continue
			}
		} else if state == 2 {
			// Expect chapter title line.
			currentTitle = line
			chapters = append(chapters, datatypes.VttChapter{
				StartTime: currentStart,
				Title:     currentTitle,
			})
			state = 1 // After reading a title, expect the next cue timing or identifier
		}
	}

	return chapters, nil
}

// parseTimestampToSeconds parses a VTT timestamp string (e.g., "HH:MM:SS.mmm", "MM:SS.mmm", "SS.mmm")
// into a float64 representing total seconds.
func parseTimestampToSeconds(ts string) (float64, error) {
	var totalSeconds float64

	// Split by '.' to separate seconds part from milliseconds part.
	partsDot := strings.Split(ts, ".")
	if len(partsDot) != 2 {
		return 0, fmt.Errorf("invalid timestamp format (missing milliseconds): %s", ts)
	}

	timeStr := partsDot[0]
	milliStr := partsDot[1]

	// Parse milliseconds.
	milliseconds, err := strconv.Atoi(milliStr)
	if err != nil {
		return 0, fmt.Errorf("invalid milliseconds in timestamp: %s", ts)
	}
	totalSeconds += float64(milliseconds) / 1000.0

	// Split by ':' for hours, minutes, seconds.
	partsColon := strings.Split(timeStr, ":")
	numParts := len(partsColon)

	if numParts < 1 || numParts > 3 {
		return 0, fmt.Errorf("invalid time part format in timestamp: %s", ts)
	}

	// Parse from right to left (seconds, then minutes, then hours).
	seconds, err := strconv.Atoi(partsColon[numParts-1])
	if err != nil {
		return 0, err
	}
	totalSeconds += float64(seconds)

	if numParts >= 2 { // Contains minutes.
		minutes, err := strconv.Atoi(partsColon[numParts-2])
		if err != nil {
			return 0, err
		}
		totalSeconds += float64(minutes * 60)
	}

	if numParts == 3 { // Contains hours.
		hours, err := strconv.Atoi(partsColon[numParts-3])
		if err != nil {
			return 0, err
		}
		totalSeconds += float64(hours * 3600)
	}

	return totalSeconds, nil
}
