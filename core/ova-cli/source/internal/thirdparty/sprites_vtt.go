package thirdparty

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

// GenerateVTT generates a WebVTT file referencing the sprite sheets created by GenerateSpriteSheets.
// keyframeTimes: slice of exact keyframe timestamps in seconds
// tile: tile layout string like "5x5" (cols x rows)
// scaleWidth, scaleHeight: size of each thumbnail in pixels
// outputPattern: the pattern of sprite sheet images, e.g. "thumb_L0_%03d.jpg"
// vttPath: path to save the generated VTT file
// urlPrefix: optional URL prefix prepended to each image path
func GenerateVTT(
	keyframeTimes []float64,
	tile string,
	scaleWidth, scaleHeight int,
	outputPattern, vttPath, urlPrefix string,
) error {
	// Parse tile string: "5x5" => cols=5, rows=5
	parts := strings.Split(tile, "x")
	if len(parts) != 2 {
		return fmt.Errorf("invalid tile format, expected NxM got %q", tile)
	}
	cols, err := strconv.Atoi(parts[0])
	if err != nil {
		return fmt.Errorf("invalid cols in tile: %w", err)
	}
	rows, err := strconv.Atoi(parts[1])
	if err != nil {
		return fmt.Errorf("invalid rows in tile: %w", err)
	}

	thumbsPerImage := cols * rows
	totalThumbs := len(keyframeTimes)

	f, err := os.Create(vttPath)
	if err != nil {
		return err
	}
	defer f.Close()

	_, err = f.WriteString("WEBVTT\n\n")
	if err != nil {
		return err
	}

	for i := 0; i < totalThumbs; i++ {
		startSec := keyframeTimes[i]
		var endSec float64
		if i < totalThumbs-1 {
			endSec = keyframeTimes[i+1]
		} else {
			// Last cue duration - arbitrarily 10 seconds or clip end
			endSec = startSec + 10
		}

		start := time.Duration(startSec * float64(time.Second))
		end := time.Duration(endSec * float64(time.Second))

		startStr := formatDuration(start)
		endStr := formatDuration(end)

		imageIndex := i / thumbsPerImage

		posInTile := i % thumbsPerImage
		row := posInTile / cols
		col := posInTile % cols

		x := col * scaleWidth
		y := row * scaleHeight

		imgFile := fmt.Sprintf(outputPattern, imageIndex+1)
		imgFile = filepath.ToSlash(imgFile)
		imgFile = urlPrefix + imgFile

		cue := fmt.Sprintf("%s --> %s\n%s#xywh=%d,%d,%d,%d\n\n", startStr, endStr, imgFile, x, y, scaleWidth, scaleHeight)
		_, err = f.WriteString(cue)
		if err != nil {
			return err
		}
	}

	return nil
}

// formatDuration formats a time.Duration to "HH:MM:SS.mmm"
func formatDuration(d time.Duration) string {
	h := int(d.Hours())
	m := int(d.Minutes()) % 60
	s := int(d.Seconds()) % 60
	ms := int(d.Milliseconds()) % 1000
	return fmt.Sprintf("%02d:%02d:%02d.%03d", h, m, s, ms)
}
