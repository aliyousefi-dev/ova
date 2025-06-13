package cmd

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"ova-cli/source/internal/localstorage"
	"ova-cli/source/internal/logs"
	"ova-cli/source/internal/repository"

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
		repoRoot, err := os.Getwd()
		if err != nil {
			pterm.Error.Println("Failed to get working directory:", err)
			return
		}

		repoPath := filepath.Join(repoRoot, ".ova-repo")
		storageDir := filepath.Join(repoPath, "storage")

		st := localstorage.NewLocalStorage(storageDir)

		arg := args[0]
		var videoPaths []string

		if arg == "all" {
			videoPaths, err = repository.GetAllVideoPaths(repoRoot)
			if err != nil || len(videoPaths) == 0 {
				pterm.Warning.Println("No videos found in the repository.")
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
		multi := pterm.DefaultMultiPrinter

		spinner, _ := pterm.DefaultSpinner.WithWriter(multi.NewWriter()).Start("Initializing...")
		progressbar, _ := pterm.DefaultProgressbar.WithTotal(total).WithWriter(multi.NewWriter()).Start("Adding videos")
		multi.Start()

		for i, absPath := range videoPaths {
			fileName := filepath.Base(absPath)
			spinner.UpdateText(fmt.Sprintf("Processing (%d/%d): %s", i+1, total, fileName))

			videoData, err := st.ProcessVideoForStorage(absPath)
			if err != nil {
				pterm.Warning.Printf("Skipping %s: %v\n", fileName, err)
				continue
			}

			if videoData.VideoID != "" {
				if err := st.AddVideo(videoData); err != nil {
					pterm.Warning.Printf("Failed to add video %s: %v\n", fileName, err)
				}
			}

			progressbar.Increment()
			time.Sleep(50 * time.Millisecond) // smooth UI
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

		repoRoot, err := os.Getwd()
		if err != nil {
			pterm.Error.Println("Failed to get working directory:", err)
			return
		}
		repoPath := filepath.Join(repoRoot, ".ova-repo")
		storageDir := filepath.Join(repoPath, "storage")

		st := localstorage.NewLocalStorage(storageDir)

		videos, err := st.GetAllVideos()
		if err != nil {
			pterm.Error.Printf("Error loading videos: %v\n", err)
			return
		}

		if len(videos) == 0 {
			pterm.Info.Println("No videos found.")
			return
		}

		// Use pterm table to display videos
		rows := pterm.TableData{{"ID", "Path"}}
		for _, v := range videos {
			rows = append(rows, []string{v.VideoID, v.FilePath})
		}
		_ = pterm.DefaultTable.WithHasHeader().WithData(rows).Render()
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

		st := localstorage.NewLocalStorage(storageDir)

		video, err := st.GetVideoByID(videoID)
		if err != nil {
			pterm.Error.Printf("Error finding video: %v\n", err)
			return
		}

		pterm.Info.Println("Video Info:")
		pterm.DefaultSection.Println("ID:", video.VideoID)
		pterm.DefaultSection.Println("Title:", video.Title)
		pterm.DefaultSection.Println("File Path:", video.FilePath)
		pterm.DefaultSection.Println("Rating:", fmt.Sprintf("%.1f", video.Rating))
		pterm.DefaultSection.Println("Duration (seconds):", fmt.Sprintf("%d", video.Duration))
		if video.ThumbnailPath != nil {
			pterm.DefaultSection.Println("Thumbnail Path:", *video.ThumbnailPath)
		} else {
			pterm.DefaultSection.Println("Thumbnail Path: <none>")
		}
		pterm.DefaultSection.Println("Tags:", fmt.Sprintf("%v", video.Tags))
		pterm.DefaultSection.Println("Uploaded At:", video.UploadedAt.Format(time.RFC3339))
		pterm.DefaultSection.Println("Views:", fmt.Sprintf("%d", video.Views))
	},
}

var videoPurgeCmd = &cobra.Command{
	Use:   "purge",
	Short: "Delete all videos",
	Run: func(cmd *cobra.Command, args []string) {
		repoRoot, err := os.Getwd()
		if err != nil {
			pterm.Error.Println("Failed to get working directory:", err)
			return
		}

		repoPath := filepath.Join(repoRoot, ".ova-repo")
		storageDir := filepath.Join(repoPath, "storage")
		st := localstorage.NewLocalStorage(storageDir)

		if err := st.DeleteAllVideos(); err != nil {
			pterm.Error.Printf("Error purging videos: %v\n", err)
			return
		}

		pterm.Success.Println("All videos have been purged.")
	},
}

func InitCommandVideo(rootCmd *cobra.Command) {
	videoCmd.AddCommand(videoAddCmd)
	videoCmd.AddCommand(videoListCmd)
	videoCmd.AddCommand(videoInfoCmd)
	videoCmd.AddCommand(videoPurgeCmd)

	rootCmd.AddCommand(videoCmd)
}
