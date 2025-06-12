package cmd

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"ova-cli/source/datatypes"
	"ova-cli/source/logs"
	"ova-cli/source/repository"
	"ova-cli/source/storage"

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

var videoAddCmd = &cobra.Command{
	Use:   "add [path|all]",
	Short: "Add video(s)",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {

		storageDir := filepath.Join(".", ".ova-repo", "storage")
		thumbDir := filepath.Join(".", ".ova-repo", "thumbnails")
		previewDir := filepath.Join(".", ".ova-repo", "previews")
		st := storage.NewStorageManager(storageDir)

		repoRoot, err := os.Getwd()
		if err != nil {
			return
		}

		arg := args[0]
		var videoPaths []string
		if arg == "all" {
			videoPaths, err = repository.GetAllVideoPaths(repoRoot)
			if err != nil || len(videoPaths) == 0 {
				return
			}
		} else {
			if _, err := os.Stat(arg); os.IsNotExist(err) {
				return
			}
			absPath, _ := filepath.Abs(arg)
			videoPaths = append(videoPaths, absPath)
		}

		total := len(videoPaths)
		multi := pterm.DefaultMultiPrinter

		spinner, _ := pterm.DefaultSpinner.WithWriter(multi.NewWriter()).Start("Initializing...")
		progressbar, _ := pterm.DefaultProgressbar.WithTotal(total).WithWriter(multi.NewWriter()).Start("Adding videos")
		multi.Start()

		for i, absPath := range videoPaths {
			fileName := filepath.Base(absPath)
			spinner.UpdateText(fmt.Sprintf("Processing (%d/%d): %s", i+1, total, fileName))

			videoData, err := storage.ProcessVideoForStorage(absPath, repoRoot, thumbDir, previewDir, st)
			if err != nil {
				// Log error but continue
				// e.g., pterm.Error.Println(err)
				continue
			}

			// If videoData.VideoID is empty, means video was skipped (already exists)
			if videoData.VideoID != "" {
				if err := st.Videos.AddVideo(videoData); err != nil {
					// Log add error but continue
					// e.g., pterm.Error.Println(err)
				}
			}

			progressbar.Increment()
			time.Sleep(50 * time.Millisecond) // smooth UI update
		}

		spinner.Success("All videos processed")
		progressbar.Stop()
		multi.Stop()

		pterm.Success.WithWriter(os.Stderr).Printfln("✅ Successfully processed %d videos.", total)
	},
}

var videoListCmd = &cobra.Command{
	Use:   "list",
	Short: "List all videos",
	Run: func(cmd *cobra.Command, args []string) {
		storageDir := filepath.Join(".", ".ova-repo", "storage")
		st := storage.NewStorageManager(storageDir)

		videos, err := st.Videos.LoadVideos()
		if err != nil {
			videoLogger.Error("Error loading videos: %v", err)
			return
		}

		videoLogger.Info("Videos:")
		for id, v := range videos {
			videoLogger.Info("- ID: %s, Path: %s", id, v.FilePath)
		}
	},
}

var videoInfoCmd = &cobra.Command{
	Use:   "info <video-id>",
	Short: "Show information about a video",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		videoID := args[0]
		storageDir := filepath.Join(".", ".ova-repo", "storage")
		st := storage.NewStorageManager(storageDir)

		video, err := st.Videos.FindVideo(videoID)
		if err != nil {
			videoLogger.Error("Error finding video: %v", err)
			return
		}

		videoLogger.Info("Video Info:")
		videoLogger.Info("ID: %s", video.VideoID)
		videoLogger.Info("Title: %s", video.Title)
		videoLogger.Info("File Path: %s", video.FilePath)
		videoLogger.Info("Rating: %.1f", video.Rating)
		videoLogger.Info("Duration (seconds): %d", video.Duration)
		if video.ThumbnailPath != nil {
			videoLogger.Info("Thumbnail Path: %s", *video.ThumbnailPath)
		} else {
			videoLogger.Info("Thumbnail Path: <none>")
		}
		videoLogger.Info("Tags: %v", video.Tags)
		videoLogger.Info("Uploaded At: %s", video.UploadedAt.Format(time.RFC3339))
		videoLogger.Info("Views: %d", video.Views)
	},
}

var videoPurgeCmd = &cobra.Command{
	Use:   "purge",
	Short: "Delete all videos",
	Run: func(cmd *cobra.Command, args []string) {
		storageDir := filepath.Join(".", ".ova-repo", "storage")
		st := storage.NewStorageManager(storageDir)

		err := st.Videos.SaveVideos(make(map[string]datatypes.VideoData))
		if err != nil {
			videoLogger.Error("Error purging videos: %v", err)
			return
		}
		videoLogger.Info("All videos purged.")
	},
}

func InitCommandVideo(rootCmd *cobra.Command) {
	videoCmd.AddCommand(videoAddCmd)
	videoCmd.AddCommand(videoListCmd)
	videoCmd.AddCommand(videoInfoCmd)
	videoCmd.AddCommand(videoPurgeCmd)

	rootCmd.AddCommand(videoCmd)
}
