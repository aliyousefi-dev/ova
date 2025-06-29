package repo

import (
	"fmt"
	"os"
	"ova-cli/source/internal/thirdparty"
	"path/filepath"
)

// GenerateStoryboardForVideo generates sprite sheet thumbnails and VTT files for a single video.
func (r *RepoManager) GenerateStoryboardForVideo(videoPath string) error {
	// Use existing method to generate unique video ID (content hash)
	videoID, err := r.GenerateVideoID(videoPath)
	if err != nil {
		return fmt.Errorf("failed to compute video ID: %w", err)
	}

	videoSpriteDir := filepath.Join(r.GetStoryboardDir(), videoID)

	if err := os.MkdirAll(videoSpriteDir, 0755); err != nil {
		return fmt.Errorf("failed to create directory for %s: %w", filepath.Base(videoPath), err)
	}

	vttPath := filepath.Join(videoSpriteDir, "thumbnails.vtt")
	if _, err := os.Stat(vttPath); err == nil {
		return fmt.Errorf("thumbnails.vtt already exists, skipping %s", filepath.Base(videoPath))
	}

	keyframeDir := filepath.Join(videoSpriteDir, "keyframes")
	if err := os.MkdirAll(keyframeDir, 0755); err != nil {
		return fmt.Errorf("failed to create keyframe dir for %s: %w", filepath.Base(videoPath), err)
	}

	if err := thirdparty.ExtractKeyframes(videoPath, keyframeDir, 160, 90); err != nil {
		return fmt.Errorf("keyframe extraction error for %s: %w", filepath.Base(videoPath), err)
	}

	spritePattern := filepath.Join(videoSpriteDir, "thumb_L0_%03d.jpg")
	if err := thirdparty.GenerateSpriteSheetsFromFolder(keyframeDir, spritePattern, "5x5", 160, 90); err != nil {
		return fmt.Errorf("sprite generation error for %s: %w", filepath.Base(videoPath), err)
	}

	keyframeTimes, err := thirdparty.GetKeyframePacketTimestamps(videoPath)
	if err != nil {
		return fmt.Errorf("failed to get keyframe timestamps for %s: %w", filepath.Base(videoPath), err)
	}
	if len(keyframeTimes) == 0 {
		return fmt.Errorf("no keyframes found for %s", filepath.Base(videoPath))
	}

	vttPattern := filepath.Join("/api/v1/storyboards", videoID, "thumb_L0_%03d.jpg")
	if err := thirdparty.GenerateVTT(keyframeTimes, "5x5", 160, 90, vttPattern, vttPath, ""); err != nil {
		return fmt.Errorf("VTT generation error for %s: %w", filepath.Base(videoPath), err)
	}

	// Clean up keyframes folder
	if err := os.RemoveAll(keyframeDir); err != nil {
		// Log but don’t fail
		fmt.Printf("Warning: failed to delete keyframe dir for %s: %v\n", filepath.Base(videoPath), err)
	}

	return nil
}
