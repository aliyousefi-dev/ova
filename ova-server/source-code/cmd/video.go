package cmd

import (
	"os"
	"path/filepath"
	"strings"
	"time"

	"ova-server/source-code/filehash"
	"ova-server/source-code/logs"
	"ova-server/source-code/repository"
	"ova-server/source-code/storage"
	"ova-server/source-code/storage/datatypes"
	"ova-server/source-code/utils"
	"ova-server/source-code/videotools"

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
		previewDir := filepath.Join(".", ".ova-repo", "previews") // NEW
		st := storage.NewStorageManager(storageDir)

		cfg, err := repository.LoadRepoConfig(".")
		if err != nil {
			videoLogger.Error("Failed to load config: %v", err)
			return
		}
		repoRoot := cfg.RepositoryPath

		arg := args[0]
		var videoPaths []string

		if arg == "all" {
			cwd, err := os.Getwd()
			if err != nil {
				videoLogger.Error("Error getting current directory: %v", err)
				return
			}
			videoLogger.Info("Scanning for all video files...")
			videoPaths, err = repository.ScanVideos(cwd)
			if err != nil {
				videoLogger.Error("Error scanning for videos: %v", err)
				return
			}
			if len(videoPaths) == 0 {
				videoLogger.Warn("No video files found.")
				return
			}
		} else {
			if _, err := os.Stat(arg); os.IsNotExist(err) {
				videoLogger.Warn("Path does not exist: %s", arg)
				return
			}
			absPath, _ := filepath.Abs(arg)
			videoPaths = append(videoPaths, absPath)
		}

		for _, absPath := range videoPaths {
			videoID, err := filehash.ComputeFileHash(absPath)
			if err != nil {
				videoLogger.Error("  Error computing hash: %v", err)
				continue
			}

			_, err = st.Videos.FindVideo(videoID)
			if err == nil {
				videoLogger.Info("  Video with ID %s already exists, skipping.", videoID)
				continue
			} else if !strings.Contains(err.Error(), "not found") {
				videoLogger.Error("  Error checking video existence: %v", err)
				continue
			}

			base := filepath.Base(absPath)
			title := strings.TrimSuffix(base, filepath.Ext(base))

			duration, err := videotools.GetVideoDuration(absPath)
			if err != nil {
				videoLogger.Error("  Error getting duration: %v", err)
				continue
			}

			resolution, err := videotools.GetVideoResolution(absPath)
			if err != nil {
				videoLogger.Error("  Error getting resolution: %v", err)
			} else {
				videoLogger.Info("  Resolution: %dx%d", resolution.Width, resolution.Height)
			}

			thumbTime := duration / 3.0
			thumbPath := filepath.Join(thumbDir, videoID+".jpg")
			err = videotools.GenerateThumbnail(absPath, thumbPath, thumbTime)
			if err != nil {
				videoLogger.Error("  Error generating thumbnail: %v", err)
				continue
			}
			videoLogger.Info("  Thumbnail generated for %s", absPath)

			// 👇 NEW: Generate preview
			previewPath := filepath.Join(previewDir, videoID+".webm")
			err = videotools.GeneratePreviewWebM(absPath, previewPath, thumbTime, 4.0)
			if err != nil {
				videoLogger.Error("  Error generating preview: %v", err)
			} else {
				videoLogger.Info("  Preview generated: %s", previewPath)
			}

			relVideoPath, err := utils.MakeRelative(repoRoot, absPath)
			if err != nil {
				videoLogger.Error("  Error making video path relative: %v", err)
				continue
			}
			relThumbPath, err := utils.MakeRelative(repoRoot, thumbPath)
			if err != nil {
				videoLogger.Error("  Error making thumbnail path relative: %v", err)
				continue
			}

			video := datatypes.GenerateVideoJSON(videoID, title, int(duration), relVideoPath, &relThumbPath, &previewPath, resolution.Width, resolution.Height)
			err = st.Videos.AddVideo(video)
			if err != nil {
				videoLogger.Error("  Error saving video: %v", err)
				continue
			}

			videoLogger.Info("  Added to storage: %s", title)
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
