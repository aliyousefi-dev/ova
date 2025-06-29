package cmd

import (
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

		repository := repo.NewRepoManager(repoRoot)
		if err := repository.Init(); err != nil {
			pterm.Error.Println("Failed to initialize repository:", err)
			return
		}

		arg := args[0]
		var videoPaths []string

		if arg == "all" {
			videoPaths, err = repository.ScanDiskForVideos()
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
		successCount := 0
		var warnings []string

		multi := pterm.DefaultMultiPrinter
		processSpinner, _ := pterm.DefaultSpinner.WithWriter(multi.NewWriter()).Start("Initializing...")
		progressbar, _ := pterm.DefaultProgressbar.WithTotal(total).WithWriter(multi.NewWriter()).Start("Adding videos")
		warningStatus, _ := pterm.DefaultSpinner.WithWriter(multi.NewWriter()).Start("Warnings: 0")
		multi.Start()

		for i, absPath := range videoPaths {
			fileName := filepath.Base(absPath)
			processSpinner.UpdateText(fmt.Sprintf("Processing (%d/%d): %s", i+1, total, fileName))

			_, err := repository.RegisterVideo(absPath)
			if err != nil {
				warnings = append(warnings, fmt.Sprintf("❌ %s: %v", fileName, err))
				warningStatus.UpdateText(fmt.Sprintf("Warnings: %d", len(warnings)))
			} else {
				successCount++
			}

			progressbar.Increment()
			time.Sleep(30 * time.Millisecond)
		}

		processSpinner.Success("All videos processed.")
		progressbar.Stop()
		if len(warnings) > 0 {
			warningStatus.Warning(fmt.Sprintf("Warnings: %d (see below)", len(warnings)))
		} else {
			warningStatus.Success("No warnings.")
		}
		multi.Stop()

		pterm.Println()
		pterm.Success.Printf("✅ Successfully processed %d of %d videos.\n", successCount, total)

		if len(warnings) > 0 {
			pterm.Warning.Println("⚠️  The following videos had issues:")
			for _, warn := range warnings {
				pterm.Println("  " + warn)
			}
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

		repository := repo.NewRepoManager(repoRoot)
		if err := repository.Init(); err != nil {
			pterm.Error.Println("Failed to initialize repository:", err)
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

			err := repository.UnregisterVideo(absPath)
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
		repoRoot, err := os.Getwd()
		if err != nil {
			pterm.Error.Println("Failed to get working directory:", err)
			return
		}

		repository := repo.NewRepoManager(repoRoot)
		if err := repository.Init(); err != nil {
			pterm.Error.Println("Failed to initialize repository:", err)
			return
		}

		videos, err := repository.GetAllVideos()
		if err != nil {
			pterm.Error.Printf("Error loading videos: %v\n", err)
			return
		}

		if len(videos) == 0 {
			pterm.Info.Println("No videos found.")
			return
		}

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

		st := jsondb.NewJsonDB(storageDir)

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
		pterm.DefaultSection.Println("Duration (seconds):", fmt.Sprintf("%d", video.DurationSeconds))
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

func InitCommandVideo(rootCmd *cobra.Command) {
	videoCmd.AddCommand(videoAddCmd)
	videoCmd.AddCommand(videoListCmd)
	videoCmd.AddCommand(videoInfoCmd)
	videoCmd.AddCommand(videoRemoveCmd)

	rootCmd.AddCommand(videoCmd)
}
