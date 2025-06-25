package cmd

import (
	"fmt"
	"os"
	"ova-cli/source/internal/logs"
	"ova-cli/source/internal/thirdparty"
	videotools "ova-cli/source/internal/thirdparty"
	"path/filepath"
	"strings"
	"time"

	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

var toolsLogger = logs.Loggers("Tools")

// root tools command
var toolsCmd = &cobra.Command{
	Use:   "tools",
	Short: "Various utility tools commands",
}

// tools mime <file-path>
// Detects and prints the MIME type of the given file
var toolsMimeCmd = &cobra.Command{
	Use:   "mime <file-path>",
	Short: "Detect MIME type of a file",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		filePath := args[0]
		mimeType, err := videotools.GetCodecsForFile(filePath)
		if err != nil {
			toolsLogger.Error("Failed to detect MIME type: %v", err)
			return
		}
		toolsLogger.Info("File: %s", filePath)
		toolsLogger.Info("MIME Type: %s", mimeType)
		fmt.Println(mimeType) // optionally print to stdout as well
	},
}

var toolsThumbnailCmd = &cobra.Command{
	Use:   "thumbnail <video-path> <thumbnail-output-path>",
	Short: "Generate a thumbnail image from a video",
	Args:  cobra.ExactArgs(2),
	Run: func(cmd *cobra.Command, args []string) {
		videoPath := args[0]
		thumbnailPath := args[1]

		// Default time
		timePos, _ := cmd.Flags().GetFloat64("time")

		err := videotools.GenerateImageFromVideo(videoPath, thumbnailPath, timePos)
		if err != nil {
			toolsLogger.Error("Failed to generate thumbnail: %v", err)
			return
		}

		toolsLogger.Info("Thumbnail generated: %s", thumbnailPath)
		fmt.Println(thumbnailPath) // Optionally print to stdout
	},
}

var toolsPreviewCmd = &cobra.Command{
	Use:   "preview <video-path> <preview-output-path>",
	Short: "Generate a short WebM preview clip from a video",
	Args:  cobra.ExactArgs(2),
	Run: func(cmd *cobra.Command, args []string) {
		videoPath := args[0]
		outputPath := args[1]

		startTime, _ := cmd.Flags().GetFloat64("start")
		duration, _ := cmd.Flags().GetFloat64("duration")

		err := videotools.GenerateWebMFromVideo(videoPath, outputPath, startTime, duration)
		if err != nil {
			toolsLogger.Error("Failed to generate preview: %v", err)
			return
		}

		toolsLogger.Info("Preview generated: %s", outputPath)
		fmt.Println(outputPath) // Print to stdout for scripting
	},
}

var toolsMp4FragCmd = &cobra.Command{
	Use:   "mp4frag <input-path>",
	Short: "Convert MP4 to fragmented MP4 (fMP4) in-place",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		filePath := args[0]

		err := videotools.ConvertMP4ToFragmentedMP4InPlace(filePath)
		if err != nil {
			toolsLogger.Error("Failed to convert to fragmented MP4: %v", err)
			return
		}

		toolsLogger.Info("Fragmented MP4 created in-place: %s", filePath)
	},
}

// GetMP4Info runs mp4info on the provided video path and returns the output as string.
var toolsInfoCmd = &cobra.Command{
	Use:   "info <video-path>",
	Short: "Print technical metadata of an MP4 file using mp4info",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		videoPath := args[0]

		info, err := videotools.GetMP4Info(videoPath)
		if err != nil {
			toolsLogger.Error("Failed to get MP4 info: %v", err)
			return
		}

		fmt.Println(info) // Final clean stdout output
	},
}

var toolsIsFragCmd = &cobra.Command{
	Use:   "isfrag <video-path>",
	Short: "Check if the MP4 file is fragmented (fMP4)",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		videoPath := args[0]

		isFrag, err := videotools.IsFragmentedMP4(videoPath)
		if err != nil {
			// Still print false on failure, as per your minimal output style
			fmt.Println("false")
			return
		}

		if isFrag {
			fmt.Println("true")
		} else {
			fmt.Println("false")
		}
	},
}

var toolsConvertCmd = &cobra.Command{
	Use:   "convert <input-path> <output-path>",
	Short: "Convert a video to MP4 format using ffmpeg",
	Args:  cobra.ExactArgs(2),
	Run: func(cmd *cobra.Command, args []string) {
		inputPath := args[0]
		outputPath := args[1]

		err := videotools.ConvertToMP4(inputPath, outputPath)
		if err != nil {
			toolsLogger.Error("Failed to convert to MP4: %v", err)
			return
		}

		toolsLogger.Info("Converted to MP4: %s", outputPath)
		fmt.Println(outputPath) // For scripting
	},
}

var toolsMp4UnfragCmd = &cobra.Command{
	Use:   "mp4unfrag <input-path>",
	Short: "Convert a fragmented MP4 (fMP4) to a standard MP4 in-place",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		filePath := args[0]

		err := videotools.ConvertFragmentedMP4ToUnfragmentedMP4InPlace(filePath)
		if err != nil {
			toolsLogger.Error("Failed to convert to unfragmented MP4: %v", err)
			return
		}

		toolsLogger.Info("Unfragmented MP4 created in-place: %s", filePath)
	},
}

var toolsKeyframesCmd = &cobra.Command{
	Use:   "keyframes <video-path>",
	Short: "Print keyframe timestamps of a video",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		videoPath := args[0]

		timestamps, err := thirdparty.GetKeyframePacketTimestamps(videoPath)
		if err != nil {
			pterm.Error.Println("❌ Failed to get keyframe timestamps:", err)
			return
		}

		if len(timestamps) == 0 {
			pterm.Warning.Println("⚠️ No keyframes found.")
			return
		}

		pterm.Success.Printf("✅ Found %d keyframe timestamps (seconds):\n", len(timestamps))
		for _, ts := range timestamps {
			pterm.Println(fmt.Sprintf(" - %.3f", ts))
		}
	},
}

var toolsSpritesheetCmd = &cobra.Command{
	Use:   "spritesheet <video-path> <output-folder>",
	Short: "Generate thumbnail sprite sheets and matching VTT file from a video",
	Args:  cobra.ExactArgs(2),
	Run: func(cmd *cobra.Command, args []string) {
		overallStart := time.Now()

		videoPath := args[0]
		outputFolder := args[1]

		if err := os.MkdirAll(outputFolder, 0755); err != nil {
			pterm.Error.Println("❌ Failed to create output folder:", err)
			return
		}

		// Read flags
		tile, err := cmd.Flags().GetString("tile")
		if err != nil {
			pterm.Error.Println("❌ Invalid tile flag:", err)
			return
		}
		scaleWidth, err := cmd.Flags().GetInt("width")
		if err != nil {
			pterm.Error.Println("❌ Invalid width flag:", err)
			return
		}
		scaleHeight, err := cmd.Flags().GetInt("height")
		if err != nil {
			pterm.Error.Println("❌ Invalid height flag:", err)
			return
		}
		urlPrefix, err := cmd.Flags().GetString("prefix")
		if err != nil {
			pterm.Error.Println("❌ Invalid prefix flag:", err)
			return
		}
		if urlPrefix != "" && !strings.HasSuffix(urlPrefix, "/") {
			urlPrefix += "/"
		}

		keyframeDir := filepath.Join(outputFolder, "keyframes")
		if err := os.MkdirAll(keyframeDir, 0755); err != nil {
			pterm.Error.Println("❌ Failed to create keyframe folder:", err)
			return
		}

		pterm.Info.Println("🎞️ Extracting keyframes...")
		err = thirdparty.ExtractKeyframes(videoPath, keyframeDir, scaleWidth, scaleHeight)
		if err != nil {
			pterm.Error.Println("❌ FFmpeg keyframe extraction failed:", err)
			return
		}
		pterm.Success.Println("✅ Keyframes extracted.")

		pterm.Info.Println("🧩 Generating sprite sheets...")
		outputPattern := filepath.Join(outputFolder, "thumb_L0_%03d.jpg")
		err = thirdparty.GenerateSpriteSheetsFromFolder(keyframeDir, outputPattern, tile, scaleWidth, scaleHeight)
		if err != nil {
			pterm.Error.Println("❌ Sprite sheet generation failed:", err)
			return
		}
		pterm.Success.Println("✅ Sprite sheets generated.")

		pterm.Info.Println("⏳ Getting keyframe timestamps...")
		keyframeTimes, err := thirdparty.GetKeyframePacketTimestamps(videoPath)
		if err != nil {
			pterm.Error.Println("❌ Failed to get keyframe timestamps:", err)
			return
		}
		if len(keyframeTimes) == 0 {
			pterm.Error.Println("❌ No keyframes found, cannot generate VTT.")
			return
		}
		pterm.Success.Printf("✅ Found %d keyframes.\n", len(keyframeTimes))

		vttPath := filepath.Join(outputFolder, "thumbnails.vtt")
		pterm.Info.Println("📝 Generating VTT file...")
		err = thirdparty.GenerateVTT(keyframeTimes, tile, scaleWidth, scaleHeight, outputPattern, vttPath, urlPrefix)
		if err != nil {
			pterm.Error.Println("❌ VTT generation failed:", err)
			return
		}
		pterm.Success.Println("✅ VTT file generated.")

		pterm.Info.Println("📁 All assets saved to:", outputFolder)

		totalElapsed := time.Since(overallStart).Round(time.Millisecond)
		pterm.Success.Printf("🎉 All done in %s\n", totalElapsed)
	},
}

// InitCommandTools initializes the tools command and its subcommands
func InitCommandTools(rootCmd *cobra.Command) {
	rootCmd.AddCommand(toolsCmd)
	toolsCmd.AddCommand(toolsMimeCmd)
	toolsCmd.AddCommand(toolsThumbnailCmd)
	toolsCmd.AddCommand(toolsPreviewCmd)
	toolsCmd.AddCommand(toolsMp4FragCmd)
	toolsCmd.AddCommand(toolsInfoCmd)
	toolsCmd.AddCommand(toolsIsFragCmd)
	toolsCmd.AddCommand(toolsConvertCmd)
	toolsCmd.AddCommand(toolsMp4UnfragCmd)
	toolsCmd.AddCommand(toolsSpritesheetCmd)
	toolsCmd.AddCommand(toolsKeyframesCmd)

	toolsSpritesheetCmd.Flags().Int("interval", 10, "Interval between thumbnails in seconds")
	toolsSpritesheetCmd.Flags().String("tile", "5x5", "Tile layout for sprite sheet (e.g., 5x5)")
	toolsSpritesheetCmd.Flags().Int("width", 160, "Thumbnail width")
	toolsSpritesheetCmd.Flags().Int("height", 90, "Thumbnail height")
	toolsSpritesheetCmd.Flags().String("prefix", "", "URL prefix for thumbnails in VTT")
	toolsSpritesheetCmd.Flags().Bool("gpu", false, "Use GPU acceleration for keyframe extraction")

	toolsThumbnailCmd.Flags().Float64("time", 5.0, "Time position (in seconds) for thumbnail")

	toolsPreviewCmd.Flags().Float64("start", 0.0, "Start time (in seconds) for preview")
	toolsPreviewCmd.Flags().Float64("duration", 5.0, "Duration (in seconds) of preview clip")
}
