package repo

import (
	"fmt"
	"os"
	"ova-cli/source/internal/datatypes"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

func (r *RepoManager) AddMarkerToVideo(videoID string, marker datatypes.VideoMarker) error {
	markers, err := r.GetMarkersForVideo(videoID)
	if err != nil {
		return err
	}

	markers = append(markers, marker)

	return r.saveMarkersToVTT(videoID, markers)
}

func (r *RepoManager) GetMarkersForVideo(videoID string) ([]datatypes.VideoMarker, error) {
	filePath := filepath.Join(r.GetStoragePath(), videoID+".vtt")
	data, err := os.ReadFile(filePath)
	if err != nil {
		if os.IsNotExist(err) {
			return []datatypes.VideoMarker{}, nil // Return empty list if file does not exist
		}
		return nil, err
	}

	content := string(data)
	lines := strings.Split(content, "\n")

	var markers []datatypes.VideoMarker
	state := 0 // 0: initial, 1: after WEBVTT/blank, 2: reading title
	var currentStartVTT string
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
		case 1: // Expecting cue timing (e.g., "00:00:00.000 --> 00:00:10.000")
			if strings.Contains(line, "-->") {
				parts := strings.Split(line, " --> ")
				if len(parts) != 2 {
					return nil, fmt.Errorf("invalid cue timing: %s", line)
				}
				currentStartVTT = parts[0] // Directly store the VTT timestamp string for parsing
				state = 2                  // Next state is to read the title
			} else {
				continue // Skip cue id or other non-timing lines
			}
		case 2: // Expecting marker title
			currentTitle = line
			h, m, s, err := datatypes.ParseVTTToHMS(currentStartVTT) // Use helper from datatypes
			if err != nil {
				return nil, fmt.Errorf("failed to parse VTT timestamp '%s': %w", currentStartVTT, err)
			}
			markers = append(markers, datatypes.VideoMarker{
				Hour:   h,
				Minute: m,
				Second: s,
				Title:  currentTitle,
			})
			state = 1 // Go back to expecting the next cue timing or blank line
		}
	}

	return markers, nil
}

func (r *RepoManager) DeleteMarkerFromVideo(videoID string, markerToDelete datatypes.VideoMarker) error {
	markers, err := r.GetMarkersForVideo(videoID)
	if err != nil {
		return err
	}

	// Convert the markerToDelete's H,M,S to a VTT string for comparison
	targetVTTTimestamp := datatypes.FormatHMSToVTT(markerToDelete.Hour, markerToDelete.Minute, markerToDelete.Second)

	filtered := make([]datatypes.VideoMarker, 0, len(markers))
	deleted := false // Flag to ensure only the first exact timestamp match is deleted
	for _, m := range markers {
		// Convert the stored marker's H,M,S to a VTT string for comparison
		storedVTTTimestamp := datatypes.FormatHMSToVTT(m.Hour, m.Minute, m.Second)
		if !deleted && storedVTTTimestamp == targetVTTTimestamp {
			// If titles also need to match for deletion, add: && m.Title == markerToDelete.Title
			deleted = true // Mark as deleted and skip adding this one to filtered list
			continue
		}
		filtered = append(filtered, m)
	}

	if !deleted {
		return fmt.Errorf("marker with timestamp '%s' not found for deletion", targetVTTTimestamp)
	}

	return r.saveMarkersToVTT(videoID, filtered)
}

func (r *RepoManager) DeleteAllMarkersFromVideo(videoID string) error {
	filePath := filepath.Join(r.GetStoragePath(), videoID+".vtt")
	if err := os.Remove(filePath); err != nil && !os.IsNotExist(err) {
		return err
	}
	return nil
}

func (r *RepoManager) saveMarkersToVTT(videoID string, markers []datatypes.VideoMarker) error {

	// Sort markers by converting their H,M,S to a comparable numerical value (total seconds).
	sort.Slice(markers, func(i, j int) bool {
		// Use the new ConvertToSeconds method from datatypes.VideoMarker
		secondsI := markers[i].ConvertToSeconds()
		secondsJ := markers[j].ConvertToSeconds()
		return secondsI < secondsJ
	})

	filePath := filepath.Join(r.GetStoryboardDir(), videoID+".vtt")

	var sb strings.Builder
	sb.WriteString("WEBVTT\n\n")

	for _, marker := range markers {
		// Convert marker's H,M,S to VTT string for the start time.
		startVTT := datatypes.FormatHMSToVTT(marker.Hour, marker.Minute, marker.Second)

		// Calculate end time by adding 10 seconds and converting back to H,M,S, then to VTT string.
		totalSeconds := marker.ConvertToSeconds()
		endSeconds := totalSeconds + 10.0
		// Convert endSeconds back to H,M,S for formatting
		d := time.Duration(endSeconds * float64(time.Second))
		endH := int(d.Hours())
		endM := int(d.Minutes()) % 60
		endS := int(d.Seconds()) % 60
		// We use 000 milliseconds for consistency with input, even if float precision might suggest otherwise
		endVTT := fmt.Sprintf("%02d:%02d:%02d.000", endH, endM, endS)

		sb.WriteString(fmt.Sprintf("%s --> %s\n", startVTT, endVTT))
		sb.WriteString(marker.Title + "\n\n")
	}

	return os.WriteFile(filePath, []byte(sb.String()), 0644)
}
