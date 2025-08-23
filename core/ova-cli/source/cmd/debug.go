package cmd

import (
	"encoding/json"
	"fmt"
	"path/filepath"

	"ova-cli/source/internal/repo"
	"ova-cli/source/internal/thirdparty" // Assuming you have the GetVideoDetails function in this package
	"ova-cli/source/internal/utils"

	"github.com/spf13/cobra"
	// Assuming the datatypes package contains VideoResolution struct
)

// debugCmd is the root debug command
var debugCmd = &cobra.Command{
	Use:   "debug",
	Short: "Print debugging information for the application",
	Run: func(cmd *cobra.Command, args []string) {
		// This will be triggered when no subcommands are provided for `debug`
		fmt.Println("Debug command invoked: use a subcommand like 'videodet' to perform operations.")
	},
}

var videoDetailsCmd = &cobra.Command{
	Use:   "videodet <path>",
	Short: "Return details about a video",
	Args:  cobra.ExactArgs(1), // Ensures exactly one argument is provided (the video path)
	Run: func(cmd *cobra.Command, args []string) {
		videoPath := args[0] // Get the path from the arguments

		// Call GetVideoDetails to get the video details
		videoDetails, err := thirdparty.GetVideoDetails(videoPath)
		if err != nil {
			fmt.Printf("Error retrieving video details: %v\n", err)
			return
		}

		// Print the video details
		fmt.Printf("Video Details:\n")
		fmt.Printf("Duration: %d seconds\n", videoDetails.DurationSec)
		fmt.Printf("FPS: %f\n", videoDetails.FrameRate)
		fmt.Printf("IsFragment: %t\n", videoDetails.IsFragment)
		fmt.Printf("Resolution: %d x %d\n", videoDetails.Resolution.Width, videoDetails.Resolution.Height)
		fmt.Printf("Video Codec: %s\n", videoDetails.VideoCodec) // Print video codec
		fmt.Printf("Audio Codec: %s\n", videoDetails.AudioCodec) // Print audio codec
		fmt.Printf("Video Format: %s\n", videoDetails.Format)    // Print audio codec
	},
}

// mp4infoCmd is a subcommand to retrieve and display MP4 information
var mp4infoCmd = &cobra.Command{
	Use:   "mp4info <path>",
	Short: "Retrieve MP4 info for the provided video file",
	Args:  cobra.ExactArgs(1), // Ensures exactly one argument is provided (the video path)
	Run: func(cmd *cobra.Command, args []string) {
		videoPath := args[0] // Get the path from the arguments

		// Call GetMP4Info to get MP4 info
		mp4Info, err := thirdparty.GetMP4Info(videoPath)
		if err != nil {
			fmt.Printf("Error retrieving MP4 info: %v\n", err)
			return
		}

		// Print the MP4 info
		fmt.Printf("MP4 Info:\n")
		fmt.Println(mp4Info)
	},
}

var pathCmd = &cobra.Command{
	Use:   "path <path>",
	Short: "Retrieve MP4 info for the provided video file",
	Args:  cobra.ExactArgs(1), // Ensures exactly one argument is provided (the video path)
	Run: func(cmd *cobra.Command, args []string) {
		// Get the path from the arguments
		videoPath := args[0]

		segmented := utils.GetPathSegments(videoPath)

		// Print the cropped path
		fmt.Printf("Root path:\n")
		fmt.Println(segmented.Root)

		// Print the cropped path
		fmt.Printf("Segment path:\n")
		fmt.Println(segmented.Subroot)
	},
}
var scanSpaceCmd = &cobra.Command{
	Use:   "scan <path>",
	Short: "Scan the specified path for video files and group them by folder structure",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		videoPath := args[0]

		if !filepath.IsAbs(videoPath) {
			var err error
			videoPath, err = filepath.Abs(videoPath)
			if err != nil {
				fmt.Printf("Error converting to absolute path: %v\n", err)
				return
			}
		}

		repoManager, err := repo.NewRepoManager(videoPath)
		if err != nil {
			fmt.Printf("Failed to initialize repository at path '%s': %v\n", videoPath, err)
			return
		}

		spaces, err := repoManager.ScanDiskForSpaces()
		if err != nil {
			fmt.Printf("Error scanning disk at path '%s': %v\n", videoPath, err)
			return
		}

		// Marshal the spaces into a formatted JSON string
		jsonOutput, err := json.MarshalIndent(spaces, "", "  ")
		if err != nil {
			fmt.Printf("Error marshaling to JSON: %v\n", err)
			return
		}

		// Print the JSON output to the console
		fmt.Println(string(jsonOutput))
	},
}

func InitCommandDebug(rootCmd *cobra.Command) {
	// Add the root `debug` command
	rootCmd.AddCommand(debugCmd)

	debugCmd.AddCommand(scanSpaceCmd)

	// Add `videoDetails` as a subcommand of `debug`
	debugCmd.AddCommand(videoDetailsCmd)
	debugCmd.AddCommand(pathCmd)
	debugCmd.AddCommand(mp4infoCmd)
}
