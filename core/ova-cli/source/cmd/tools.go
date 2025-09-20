package cmd

import (
	"fmt"
	"ova-cli/source/internal/logs"
	"ova-cli/source/internal/thirdparty"

	"github.com/spf13/cobra"
)

var toolsLogger = logs.Loggers("Tools")

// root tools command
var toolsCmd = &cobra.Command{
	Use:   "tools",
	Short: "Various utility tools commands",
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

		err := thirdparty.GenerateImageFromVideo(videoPath, thumbnailPath, timePos)
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

		err := thirdparty.GenerateWebMFromVideo(videoPath, outputPath, startTime, duration)
		if err != nil {
			toolsLogger.Error("Failed to generate preview: %v", err)
			return
		}

		toolsLogger.Info("Preview generated: %s", outputPath)
		fmt.Println(outputPath) // Print to stdout for scripting
	},
}

// GetMP4Info runs mp4info on the provided video path and returns the output as string.
var toolsInfoCmd = &cobra.Command{
	Use:   "videoinfo <video-path>",
	Short: "Print technical metadata of an MP4 file using mp4info",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		videoPath := args[0]

		info, err := thirdparty.GetMP4Info(videoPath)
		if err != nil {
			toolsLogger.Error("Failed to get MP4 info: %v", err)
			return
		}

		fmt.Println(info) // Final clean stdout output
	},
}

// InitCommandTools initializes the tools command and its subcommands
func InitCommandTools(rootCmd *cobra.Command) {
	rootCmd.AddCommand(toolsCmd)
	toolsCmd.AddCommand(toolsThumbnailCmd)
	toolsCmd.AddCommand(toolsPreviewCmd)
	toolsCmd.AddCommand(toolsInfoCmd)

	toolsThumbnailCmd.Flags().Float64("time", 5.0, "Time position (in seconds) for thumbnail")

	toolsPreviewCmd.Flags().Float64("start", 0.0, "Start time (in seconds) for preview")
	toolsPreviewCmd.Flags().Float64("duration", 5.0, "Duration (in seconds) of preview clip")
}
