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

	toolsThumbnailCmd.Flags().Float64("time", 5.0, "Time position (in seconds) for thumbnail")

	toolsPreviewCmd.Flags().Float64("start", 0.0, "Start time (in seconds) for preview")
	toolsPreviewCmd.Flags().Float64("duration", 5.0, "Duration (in seconds) of preview clip")
}
