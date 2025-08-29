package cmd

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"ova-cli/source/internal/datastorage/jsondb"
	"ova-cli/source/internal/logs"
	"ova-cli/source/internal/repo"

	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

var videoLogger = logs.Loggers("Video")

var videoCmd = &cobra.Command{
	Use:   "video",
	Short: "Manage videos",
	Run: func(cmd *cobra.Command, args []string) {
		videoLogger.Info("Video command invoked: use a subcommand (add, list, info, purge)")
	},
}

// Command to add a single video
var videoAddOneCmd = &cobra.Command{
	Use:   "addone [path]",
	Short: "Add a single video",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		repoRoot, err := os.Getwd()
		if err != nil {
			fmt.Println("Failed to get working directory:", err)
			return
		}

		repository, err := repo.NewRepoManager(repoRoot)
		if err != nil {
			fmt.Println("Failed to initialize repository:", err)
			return
		}

		// Process single video (arg is a specific path)
		absPath, err := filepath.Abs(args[0])
		if err != nil {
			fmt.Println("Failed to get absolute path:", err)
			return
		}

		if _, err := os.Stat(absPath); os.IsNotExist(err) {
			fmt.Printf("Error: Specified file '%s' does not exist.\n", absPath)
			return
		}

		// Get the value of the --cook flag
		cook, _ := cmd.Flags().GetBool("cook")

		// Use AddOneVideo to add the single video
		err = repository.AddOneVideo(absPath, cook)
		if err != nil {
			fmt.Println("Failed to add video:", err)
			return
		}
	},
}

var videoRemoveCmd = &cobra.Command{
	Use:   "remove [path|all]",
	Short: "Remove video(s)",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		repoRoot, err := os.Getwd()
		if err != nil {
			pterm.Error.Println("Failed to get working directory:", err)
			return
		}

		repository, err := repo.NewRepoManager(repoRoot)
		if err != nil {
			fmt.Println("Failed to initialize repository:", err)
			return
		}

		arg := args[0]
		var videoPaths []string

		if arg == "all" {
			confirm, _ := pterm.DefaultInteractiveConfirm.Show("⚠️  Are you sure you want to remove ALL videos?")
			if !confirm {
				pterm.Info.Println("Operation cancelled.")
				return
			}

			videoPaths, err = repository.ScanDiskForVideos()
			if err != nil {
				pterm.Error.Println("Failed to retrieve video paths:", err)
				return
			}
		} else {
			if _, err := os.Stat(arg); os.IsNotExist(err) {
				pterm.Error.Println("Specified file does not exist.")
				return
			}
			absPath, _ := filepath.Abs(arg)
			videoPaths = append(videoPaths, absPath)
		}

		total := len(videoPaths)
		successCount := 0
		var warnings []string

		multi := pterm.DefaultMultiPrinter
		processSpinner, _ := pterm.DefaultSpinner.WithWriter(multi.NewWriter()).Start("Initializing...")
		progressbar, _ := pterm.DefaultProgressbar.WithTotal(total).WithWriter(multi.NewWriter()).Start("Removing videos")
		warningStatus, _ := pterm.DefaultSpinner.WithWriter(multi.NewWriter()).Start("Warnings: 0")
		multi.Start()

		for i, absPath := range videoPaths {
			fileName := filepath.Base(absPath)
			processSpinner.UpdateText(fmt.Sprintf("Removing (%d/%d): %s", i+1, total, fileName))

			err := repository.UnIndexVideo(absPath)
			if err != nil {
				warnings = append(warnings, fmt.Sprintf("⚠️  %s: failed to remove: %v", fileName, err))
				warningStatus.UpdateText(fmt.Sprintf("Warnings: %d", len(warnings)))
			} else {
				successCount++
			}

			progressbar.Increment()
			time.Sleep(30 * time.Millisecond)
		}

		processSpinner.Success("All removals processed.")
		progressbar.Stop()
		if len(warnings) > 0 {
			warningStatus.Warning(fmt.Sprintf("Warnings: %d (see below)", len(warnings)))
		} else {
			warningStatus.Success("No warnings.")
		}
		multi.Stop()

		pterm.Println()
		pterm.Success.Printf("✅ Successfully removed %d of %d videos.\n", successCount, total)

		if len(warnings) > 0 {
			pterm.Warning.Println("⚠️  The following removals had issues:")
			for _, warn := range warnings {
				pterm.Println("  " + warn)
			}
		}
	},
}

var videoListCmd = &cobra.Command{
	Use:   "list",
	Short: "List all videos",
	Run: func(cmd *cobra.Command, args []string) {
		// Get the repository address from the --repository flag
		repoAddress, _ := cmd.Flags().GetString("repository")

		// If repository address is not provided, use the current working directory
		if repoAddress == "" {
			repoAddress, _ = os.Getwd()
		}

		// Initialize the repository
		repository, err := repo.NewRepoManager(repoAddress)
		if err != nil {
			fmt.Println("Failed to initialize repository:", err)
			return
		}

		// Fetch all videos
		videos, err := repository.GetAllIndexedVideos()
		if err != nil {
			fmt.Printf("Error loading videos: %v\n", err)
			return
		}

		// If no videos are found
		if len(videos) == 0 {
			fmt.Println("No videos found.")
			return
		}

		// Check if --json flag is set
		jsonFlag, _ := cmd.Flags().GetBool("json")
		if jsonFlag {
			// If --json is passed, return data in JSON format
			videoData := make([]map[string]string, len(videos))
			for i, v := range videos {
				videoData[i] = map[string]string{
					"ID":   v.VideoID,
					"Path": v.FileName,
				}
			}

			// Marshal the video data into JSON format
			jsonData, err := json.Marshal(videoData) // Use json.Marshal (without indenting) to get a clean JSON format
			if err != nil {
				fmt.Println("Failed to marshal video data to JSON:", err)
				return
			}

			// Print the JSON output without using pterm
			fmt.Println(string(jsonData)) // Print the JSON output
		} else {
			// If no --json flag is passed, display data in table format
			fmt.Println("ID\tPath")
			for _, v := range videos {
				fmt.Printf("%s\t%s\n", v.VideoID, v.FileName)
			}
		}
	},
}

var videoInfoCmd = &cobra.Command{
	Use:   "info <video-id>",
	Short: "Show information about a video",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		videoID := args[0]

		repoRoot, err := os.Getwd()
		if err != nil {
			pterm.Error.Println("Failed to get working directory:", err)
			return
		}
		repoPath := filepath.Join(repoRoot, ".ova-repo")
		storageDir := filepath.Join(repoPath, "storage")

		st := jsondb.NewJsonDB(storageDir)

		video, err := st.GetVideoByID(videoID)
		if err != nil {
			pterm.Error.Printf("Error finding video: %v\n", err)
			return
		}

		pterm.Info.Println("Video Info:")
		pterm.DefaultSection.Println("ID:", video.VideoID)
		pterm.DefaultSection.Println("File Name:", video.FileName)
		pterm.DefaultSection.Println("Owned Space:", video.OwnedSpace)
		pterm.DefaultSection.Println("Duration (seconds):", fmt.Sprintf("%d", video.Codecs.DurationSec))
		pterm.DefaultSection.Println("Tags:", fmt.Sprintf("%v", video.Tags))
		pterm.DefaultSection.Println("Uploaded At:", video.UploadedAt.Format(time.RFC3339))
	},
}

func InitCommandVideo(rootCmd *cobra.Command) {

	videoAddOneCmd.Flags().Bool("cook", false, "Cook video after adding (default: false)")

	videoCmd.AddCommand(videoAddOneCmd)

	videoCmd.AddCommand(videoListCmd)
	videoCmd.AddCommand(videoInfoCmd)
	videoCmd.AddCommand(videoRemoveCmd)

	videoListCmd.Flags().BoolP("json", "j", false, "Output the data in JSON format")
	videoListCmd.Flags().StringP("repository", "r", "", "Specify the repository directory")

	rootCmd.AddCommand(videoCmd)
}
