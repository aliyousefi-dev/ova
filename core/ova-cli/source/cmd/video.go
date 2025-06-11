package cmd

import (
	"os"
	"path/filepath"
	"strings"
	"time"

	"ova-cli/source/datatypes"
	"ova-cli/source/filehash"
	"ova-cli/source/logs"
	"ova-cli/source/repository"
	"ova-cli/source/storage"
	"ova-cli/source/utils"

	"github.com/schollz/progressbar/v3"
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
		// Initialize storage directories and manager
		storageDir := filepath.Join(".", ".ova-repo", "storage")
		thumbDir := filepath.Join(".", ".ova-repo", "thumbnails")
		previewDir := filepath.Join(".", ".ova-repo", "previews")
		st := storage.NewStorageManager(storageDir)

		// Get current working directory
		repoRoot, err := os.Getwd()
		if err != nil {
			// Just exit silently on error
			return
		}

		// Determine argument (single path or "all")
		arg := args[0]
		var videoPaths []string

		// Handle "all" argument to scan all video files in current directory
		if arg == "all" {
			cwd, err := os.Getwd()
			if err != nil {
				return
			}
			videoPaths, err = repository.GetAllVideoPaths(cwd)
			if err != nil {
				return
			}
			if len(videoPaths) == 0 {
				return
			}
		} else {
			// Handle single path argument
			if _, err := os.Stat(arg); os.IsNotExist(err) {
				return
			}
			absPath, _ := filepath.Abs(arg)
			videoPaths = append(videoPaths, absPath)
		}

		// Initialize progress bar
		total := len(videoPaths)
		bar := progressbar.NewOptions(
			total,
			progressbar.OptionSetDescription("Processing videos"),
			progressbar.OptionSetWriter(os.Stderr),
			progressbar.OptionShowCount(),
			progressbar.OptionClearOnFinish(),
		)

		// Process each video path
		for _, absPath := range videoPaths {
			fileName := filepath.Base(absPath)
			bar.Describe("Processing: " + fileName)
			bar.RenderBlank() // force immediate refresh with new description

			videoID, err := filehash.ComputeFileHash(absPath)
			if err != nil {
				bar.Add(1)
				continue
			}

			_, err = st.Videos.FindVideo(videoID)
			if err == nil {
				bar.Add(1)
				continue
			} else if !strings.Contains(err.Error(), "not found") {
				bar.Add(1)
				continue
			}

			metadata, thumbPath, previewPath, err := storage.GenerateVideoPreviewAndThumbnail(absPath, thumbDir, previewDir, videoID)
			if err != nil {
				bar.Add(1)
				continue
			}

			relVideoPath, err := utils.MakeRelative(repoRoot, absPath)
			if err != nil {
				bar.Add(1)
				continue
			}
			relThumbPath, err := utils.MakeRelative(repoRoot, thumbPath)
			if err != nil {
				bar.Add(1)
				continue
			}

			video := datatypes.GenerateVideoJSON(
				videoID,
				strings.TrimSuffix(filepath.Base(absPath), filepath.Ext(absPath)),
				int(metadata.Duration),
				relVideoPath,
				&relThumbPath,
				&previewPath,
				metadata.Resolution.Width,
				metadata.Resolution.Height,
				metadata.MimeType,
			)
			err = st.Videos.AddVideo(video)
			if err != nil {
				bar.Add(1)
				continue
			}

			bar.Add(1)
		}

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
