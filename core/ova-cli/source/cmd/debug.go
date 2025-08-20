package cmd

import (
	"fmt"

	"ova-cli/source/internal/thirdparty" // Assuming you have the GetVideoDetails function in this package

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
		fmt.Printf("Duration: %f seconds\n", videoDetails.Duration)
		fmt.Printf("FPS: %f\n", videoDetails.FPS)
		fmt.Printf("Resolution: %d x %d\n", videoDetails.Resolution.Width, videoDetails.Resolution.Height)
		fmt.Printf("BitRate: %d bps\n", videoDetails.BitRate)
		fmt.Printf("Video Codec: %s\n", videoDetails.VideoCodec) // Print video codec
		fmt.Printf("Audio Codec: %s\n", videoDetails.AudioCodec) // Print audio codec
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

func InitCommandDebug(rootCmd *cobra.Command) {
	// Add the root `debug` command
	rootCmd.AddCommand(debugCmd)

	// Add `videoDetails` as a subcommand of `debug`
	debugCmd.AddCommand(videoDetailsCmd)
	debugCmd.AddCommand(mp4infoCmd)
}
