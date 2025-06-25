package thirdparty

import (
	"bytes"
	"fmt"
	"image"
	"image/color"
	"image/draw"
	"image/jpeg"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"sync"
)

// ExtractKeyframes uses ffmpeg to extract evenly spaced keyframes (1 every 10 seconds)
func ExtractKeyframes(videoPath, outputDir string, thumbWidth, thumbHeight int) error {
	ffmpegPath, err := GetFFmpegPath()
	if err != nil {
		return err
	}

	// Create output directory if not exists
	if err := os.MkdirAll(outputDir, 0755); err != nil {
		return fmt.Errorf("failed to create output dir: %w", err)
	}

	outputPattern := filepath.Join(outputDir, "keyframe_%04d.jpg")

	args := []string{
		"-threads", "8", // Use CPU threads
		"-skip_frame", "nokey", // Extract only keyframes
		"-i", videoPath, // Input file
		"-vsync", "passthrough", // Preserve timestamps
		"-vf", fmt.Sprintf("scale=w=%d:h=%d:force_original_aspect_ratio=decrease", thumbWidth, thumbHeight),
		"-q:v", "5", // Quality parameter for JPEG
		outputPattern, // Output filename pattern
	}

	cmd := exec.Command(ffmpegPath, args...)

	// Capture stderr to get ffmpeg error messages
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	cmd.Stdout = io.Discard

	if err := cmd.Run(); err != nil {
		return fmt.Errorf("ffmpeg command failed: %w: %s", err, stderr.String())
	}

	return nil
}

// GenerateSpriteSheetsFromFolder loads all images from keyframe folder and assembles sprite sheets
func GenerateSpriteSheetsFromFolder(inputDir, outputPattern, tile string, thumbWidth, thumbHeight int) error {
	parts := strings.Split(tile, "x")
	if len(parts) != 2 {
		return fmt.Errorf("invalid tile format: %s", tile)
	}
	cols, err := strconv.Atoi(parts[0])
	if err != nil {
		return fmt.Errorf("invalid cols: %w", err)
	}
	rows, err := strconv.Atoi(parts[1])
	if err != nil {
		return fmt.Errorf("invalid rows: %w", err)
	}
	totalPerSheet := cols * rows

	entries, err := os.ReadDir(inputDir)
	if err != nil {
		return fmt.Errorf("read keyframes dir: %w", err)
	}

	var framePaths []string
	for _, entry := range entries {
		if !entry.IsDir() && strings.HasSuffix(entry.Name(), ".jpg") {
			framePaths = append(framePaths, filepath.Join(inputDir, entry.Name()))
		}
	}
	if len(framePaths) == 0 {
		return fmt.Errorf("no keyframes found in %s", inputDir)
	}

	sort.Strings(framePaths)

	sheetNum := 1
	for i := 0; i < len(framePaths); i += totalPerSheet {
		end := i + totalPerSheet
		if end > len(framePaths) {
			end = len(framePaths)
		}
		batch := framePaths[i:end]

		spriteWidth := cols * thumbWidth
		spriteHeight := rows * thumbHeight
		spriteSheet := image.NewRGBA(image.Rect(0, 0, spriteWidth, spriteHeight))

		draw.Draw(spriteSheet, spriteSheet.Bounds(), &image.Uniform{C: color.Black}, image.Point{}, draw.Src)

		thumbs := make([]*image.RGBA, len(batch))
		errs := make([]error, len(batch))
		var wg sync.WaitGroup
		wg.Add(len(batch))

		for idx, path := range batch {
			go func(i int, filePath string) {
				defer wg.Done()
				file, err := os.Open(filePath)
				if err != nil {
					errs[i] = fmt.Errorf("open %s: %v", filePath, err)
					return
				}
				defer file.Close()

				img, err := jpeg.Decode(file)
				if err != nil {
					errs[i] = fmt.Errorf("decode %s: %v", filePath, err)
					return
				}

				thumbs[i] = resizeImage(img, thumbWidth, thumbHeight)
			}(idx, path)
		}
		wg.Wait()

		for idx, thumb := range thumbs {
			if thumb == nil {
				continue
			}
			x := (idx % cols) * thumbWidth
			y := (idx / cols) * thumbHeight
			rect := image.Rect(x, y, x+thumbWidth, y+thumbHeight)
			draw.Draw(spriteSheet, rect, thumb, image.Point{}, draw.Over)
		}

		outPath := fmt.Sprintf(outputPattern, sheetNum)
		outFile, err := os.Create(outPath)
		if err != nil {
			return fmt.Errorf("create sprite file: %w", err)
		}
		err = jpeg.Encode(outFile, spriteSheet, &jpeg.Options{Quality: 75})
		outFile.Close()
		if err != nil {
			return fmt.Errorf("encode sprite file: %w", err)
		}

		sheetNum++
	}

	return nil
}

func resizeImage(img image.Image, width, height int) *image.RGBA {
	dst := image.NewRGBA(image.Rect(0, 0, width, height))
	srcBounds := img.Bounds()
	for y := 0; y < height; y++ {
		for x := 0; x < width; x++ {
			srcX := srcBounds.Min.X + x*srcBounds.Dx()/width
			srcY := srcBounds.Min.Y + y*srcBounds.Dy()/height
			dst.Set(x, y, img.At(srcX, srcY))
		}
	}
	return dst
}
