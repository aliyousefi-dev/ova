package cmd

import (
	"fmt"
	"ova-cli/source/logs"
	"ova-cli/source/videotools"

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
		mimeType, err := videotools.GetMimeTypeForFile(filePath)
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

		err := videotools.GenerateThumbnail(videoPath, thumbnailPath, timePos)
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

		err := videotools.GeneratePreviewWebM(videoPath, outputPath, startTime, duration)
		if err != nil {
			toolsLogger.Error("Failed to generate preview: %v", err)
			return
		}

		toolsLogger.Info("Preview generated: %s", outputPath)
		fmt.Println(outputPath) // Print to stdout for scripting
	},
}

// InitCommandTools initializes the tools command and its subcommands
func InitCommandTools(rootCmd *cobra.Command) {
	rootCmd.AddCommand(toolsCmd)
	toolsCmd.AddCommand(toolsMimeCmd)
	toolsCmd.AddCommand(toolsThumbnailCmd)
	toolsCmd.AddCommand(toolsPreviewCmd) // ⬅️ Add this line

	toolsThumbnailCmd.Flags().Float64("time", 5.0, "Time position (in seconds) for thumbnail")

	toolsPreviewCmd.Flags().Float64("start", 0.0, "Start time (in seconds) for preview")
	toolsPreviewCmd.Flags().Float64("duration", 5.0, "Duration (in seconds) of preview clip")
}
