package localstorage

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"ova-cli/source/internal/datatypes"
)

func (s *LocalStorage) ensureChaptersDir() error {
	dir := s.GetVideoChaptersDir()
	return os.MkdirAll(dir, 0755)
}

// formatSecondsToTimestamp converts seconds (float64) to "HH:MM:SS.mmm" format required by VTT
func formatSecondsToTimestamp(seconds float64) string {
	d := time.Duration(seconds * float64(time.Second))
	h := int(d.Hours())
	m := int(d.Minutes()) % 60
	s := int(d.Seconds()) % 60
	ms := int(d.Milliseconds()) % 1000
	return fmt.Sprintf("%02d:%02d:%02d.%03d", h, m, s, ms)
}

func (s *LocalStorage) UpdateVttChapters(videoID string, chapters []datatypes.VttChapter) error {
	if err := s.ensureChaptersDir(); err != nil {
		return err
	}

	filePath := filepath.Join(s.GetVideoChaptersDir(), videoID+".vtt")

	// Build VTT content
	var sb strings.Builder
	sb.WriteString("WEBVTT\n\n")

	for i, ch := range chapters {
		startTimestamp := formatSecondsToTimestamp(ch.StartTime)

		var endTimestamp string
		if i+1 < len(chapters) {
			endTimestamp = formatSecondsToTimestamp(chapters[i+1].StartTime)
		} else {
			// Last chapter, arbitrarily add 60 seconds duration (adjust if needed)
			endTimestamp = formatSecondsToTimestamp(ch.StartTime + 60)
		}

		// Write chapter cue
		sb.WriteString(fmt.Sprintf("%s --> %s\n", startTimestamp, endTimestamp))
		sb.WriteString(ch.Title + "\n\n")
	}

	// Write to file (overwrite)
	return os.WriteFile(filePath, []byte(sb.String()), 0644)
}

func (s *LocalStorage) GetVttChapters(videoID string) ([]datatypes.VttChapter, error) {
	filePath := filepath.Join(s.GetVideoChaptersDir(), videoID+".vtt")

	data, err := os.ReadFile(filePath)
	if err != nil {
		if os.IsNotExist(err) {
			// File doesn't exist — return empty chapters slice without error
			return []datatypes.VttChapter{}, nil
		}
		return nil, err
	}

	content := string(data)
	lines := strings.Split(content, "\n")

	var chapters []datatypes.VttChapter
	var currentStart float64
	var currentTitle string
	state := 0 // 0 = expect header or empty, 1 = expect cue timing, 2 = expect title

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}

		if state == 0 {
			// expect "WEBVTT"
			if line == "WEBVTT" {
				state = 1
				continue
			} else {
				return nil, fmt.Errorf("invalid VTT file: missing WEBVTT header")
			}
		} else if state == 1 {
			// expect cue timing like "00:00:00.000 --> 00:01:30.000"
			parts := strings.Split(line, " --> ")
			if len(parts) != 2 {
				return nil, fmt.Errorf("invalid cue timing line: %s", line)
			}
			startTimeStr := parts[0]

			startSeconds, err := parseTimestampToSeconds(startTimeStr)
			if err != nil {
				return nil, err
			}

			currentStart = startSeconds
			state = 2
		} else if state == 2 {
			// expect title line
			currentTitle = line
			chapters = append(chapters, datatypes.VttChapter{
				StartTime: currentStart,
				Title:     currentTitle,
			})
			state = 1
		}
	}

	return chapters, nil
}

// parseTimestampToSeconds parses "HH:MM:SS.mmm" timestamp to seconds float64
func parseTimestampToSeconds(ts string) (float64, error) {
	// Expected format: "HH:MM:SS.mmm"
	parts := strings.Split(ts, ":")
	if len(parts) != 3 {
		return 0, fmt.Errorf("invalid timestamp format: %s", ts)
	}

	hours, err := strconv.Atoi(parts[0])
	if err != nil {
		return 0, err
	}
	minutes, err := strconv.Atoi(parts[1])
	if err != nil {
		return 0, err
	}
	secsParts := strings.Split(parts[2], ".")
	if len(secsParts) != 2 {
		return 0, fmt.Errorf("invalid seconds.milliseconds format: %s", parts[2])
	}
	seconds, err := strconv.Atoi(secsParts[0])
	if err != nil {
		return 0, err
	}
	milliseconds, err := strconv.Atoi(secsParts[1])
	if err != nil {
		return 0, err
	}

	totalSeconds := float64(hours*3600 + minutes*60 + seconds)
	totalSeconds += float64(milliseconds) / 1000.0
	return totalSeconds, nil
}
