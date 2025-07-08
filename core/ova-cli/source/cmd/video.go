package cmd

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
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

// Define structs for your progress messages to ensure consistent JSON structure
type ProgressUpdate struct {
	Type     string `json:"type"` // e.g., "progress", "warning", "summary"
	Current  int    `json:"current,omitempty"`
	Total    int    `json:"total,omitempty"`
	Filename string `json:"filename,omitempty"`
	Message  string `json:"message,omitempty"`
	Hash     string `json:"hash,omitempty"`
	Error    string `json:"error,omitempty"`
	Skipped  bool   `json:"skipped,omitempty"`
}

var videoAddCmd = &cobra.Command{
	Use:   "add [path|all]",
	Short: "Add video(s)",
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

		arg := args[0]
		var videosToProcess []string // Renamed for clarity: these are the final videos to be registered

		// Get the total video count on disk and print it
		totalVideosOnDisk, err := repository.GetVideoCountOnDisk()
		if err != nil {
			fmt.Println("Failed to scan videos on disk:", err)
			return
		}
		fmt.Printf("Total %d videos found on disk.\n", totalVideosOnDisk)

		if arg == "all" {
			// Get all unindexed videos first. These are candidates for adding.
			unindexedVideoPaths, err := repository.GetUnindexedVideos()
			if err != nil {
				fmt.Println("Failed to get unindexed videos:", err)
				return
			}
			if len(unindexedVideoPaths) == 0 {
				fmt.Println("No unindexed videos found on disk to add.")
				return
			}

			// Convert unindexedVideoPaths to a map for faster lookups
			unindexedMap := make(map[string]struct{})
			for _, p := range unindexedVideoPaths {
				unindexedMap[p] = struct{}{}
			}

			// Calculate and print how many videos are already indexed
			indexedCount := totalVideosOnDisk - len(unindexedVideoPaths)
			if indexedCount > 0 {
				fmt.Printf("Skipping %d videos that are already indexed.\n", indexedCount)
			}
			fmt.Println("Unindexed videos found on disk (potential candidates for indexing):")
			for _, path := range unindexedVideoPaths {
				fmt.Printf("  %s\n", path)
			}

			// Scan for duplicates across ALL videos on disk (both indexed and unindexed).
			// This gives us the full picture of duplicate files.
			duplicates, err := repository.ScanDiskForDuplicateVideos()
			if err != nil {
				fmt.Println("Failed to scan for duplicates:", err)
				return
			}

			if len(duplicates) > 0 {
				fmt.Println("\n--- Analyzing Duplicates ---")
				// Use a map to store paths that have been selected for processing
				// or explicitly skipped due to duplicate rules.
				// This ensures we don't process a file multiple times or conflictingly.
				processedPaths := make(map[string]bool) // true if added to videosToProcess, false if explicitly skipped

				for hash, paths := range duplicates {
					var indexedInDuplicateSet []string
					var unindexedInDuplicateSet []string

					// Categorize paths in this duplicate set based on unindexedMap
					for _, p := range paths {
						if _, exists := unindexedMap[p]; exists {
							unindexedInDuplicateSet = append(unindexedInDuplicateSet, p)
						} else {
							indexedInDuplicateSet = append(indexedInDuplicateSet, p)
						}
					}

					fmt.Printf("  Duplicate set (Hash: %s):\n", hash)
					for _, p := range paths {
						fmt.Printf("    - %s\n", p)
					}

					if len(indexedInDuplicateSet) > 0 {
						// Rule 2: If *some* duplicates are already indexed, skip all in this set.
						fmt.Printf("  -> Decision: Skipping this entire duplicate set because at least one video (e.g., %s) is already indexed.\n", indexedInDuplicateSet[0])
						for _, p := range paths {
							processedPaths[p] = false // Mark as skipped
						}
					} else if len(unindexedInDuplicateSet) > 0 {
						// Rule 1: All duplicates in this set are unindexed. Pick one.
						// We choose the first one, but any consistent choice is fine.
						chosenPath := unindexedInDuplicateSet[0]
						videosToProcess = append(videosToProcess, chosenPath)
						processedPaths[chosenPath] = true // Mark as added
						fmt.Printf("  -> Decision: All are unindexed. Selecting '%s' for indexing. Other duplicates in this set will be skipped.\n", filepath.Base(chosenPath))

						// Mark others in this set as skipped
						for _, p := range unindexedInDuplicateSet {
							if p != chosenPath {
								processedPaths[p] = false
							}
						}
					}
					fmt.Println("") // Newline for readability
				}

				// Now, add any unindexed videos that were *not* part of any duplicate set
				// or were not explicitly processed by the duplicate logic.
				for _, path := range unindexedVideoPaths {
					if _, wasProcessed := processedPaths[path]; !wasProcessed {
						videosToProcess = append(videosToProcess, path)
					}
				}

				if len(videosToProcess) > 0 && len(videosToProcess) < len(unindexedVideoPaths) {
					fmt.Printf("\nAfter duplicate analysis, %d videos are selected for indexing out of %d initially unindexed videos.\n", len(videosToProcess), len(unindexedVideoPaths))
					var userInput string
					fmt.Println("Do you want to continue with indexing the selected videos? (y/n):")
					fmt.Scanln(&userInput)
					if strings.ToLower(userInput) != "y" {
						fmt.Println("Aborting operation as requested.")
						return
					}
				} else if len(videosToProcess) == 0 && len(unindexedVideoPaths) > 0 {
					fmt.Println("\nAll unindexed videos were skipped due to duplicate rules. No videos to index.")
					return
				}

			} else {
				// No duplicates found, so all unindexed videos are candidates for addition
				fmt.Println("\nNo duplicate videos found. All unindexed videos will be considered for indexing.")
				videosToProcess = unindexedVideoPaths
			}

		} else {
			// Process single video (arg is a specific path)
			absPath, err := filepath.Abs(arg)
			if err != nil {
				fmt.Println("Failed to get absolute path:", err)
				return
			}

			if _, err := os.Stat(absPath); os.IsNotExist(err) {
				fmt.Printf("Error: Specified file '%s' does not exist.\n", absPath)
				return
			}

			// Check if the single video is already indexed (important for single adds)
			videoID, err := repository.GenerateVideoID(absPath)
			if err != nil {
				fmt.Println("Error generating video ID for single path:", err)
				return
			}
			existingVideo, err := repository.GetVideoByID(videoID)
			if err == nil && existingVideo != nil {
				fmt.Printf("Video '%s' (ID: %s) is already indexed. Skipping.\n", filepath.Base(absPath), videoID)
				return
			}

			videosToProcess = append(videosToProcess, absPath)
		}

		// --- Indexing Process (remains largely the same, but uses videosToProcess) ---
		if len(videosToProcess) == 0 {
			fmt.Println("No videos to index after selection and duplicate filtering.")
			return
		}

		fmt.Printf("\nStarting to index %d video(s)...\n", len(videosToProcess))

		total := len(videosToProcess)
		successCount := 0
		var warnings []string

		const maxFilenameLength = 50

		for i, absPath := range videosToProcess {
			// Ensure the absolute path is correct
			absPath = filepath.Clean(absPath)

			// Truncate long filenames for display
			fileName := filepath.Base(absPath)
			if len(fileName) > maxFilenameLength {
				fileName = fileName[:maxFilenameLength] + "..."
			}

			// Print the process message on a new line
			fmt.Printf("Processing (%d/%d): %s \n", i+1, total, fileName)

			// Important: Re-check if the video exists in the database just before registering.
			// This guards against race conditions or inconsistent states, though less likely here.
			videoID, err := repository.GenerateVideoID(absPath)
			if err != nil {
				warnings = append(warnings, fmt.Sprintf("Failed to generate ID for %s: %v", fileName, err))
				continue
			}

			existingVideo, err := repository.GetVideoByID(videoID)
			if err == nil && existingVideo != nil {
				warnings = append(warnings, fmt.Sprintf("Skipped %s: video with ID %s already exists (should have been filtered earlier).", fileName, videoID))
				continue // Skip if it somehow already exists
			}

			// Register the video
			_, err = repository.RegisterVideoWithAbsolutePath(absPath) // Assuming RegisterVideo takes an absolute path
			if err != nil {
				warnings = append(warnings, fmt.Sprintf("%s: %v", fileName, err))
			} else {
				successCount++
			}

			// Simulate some processing time
			time.Sleep(100 * time.Millisecond)
		}

		// Print final summary
		fmt.Printf("\nSuccessfully processed %d of %d videos.\n", successCount, total)

		if len(warnings) > 0 {
			fmt.Println("The following videos had issues or were skipped:")
			for _, warn := range warnings {
				fmt.Println("  " + warn)
			}
		} else {
			fmt.Println("No warnings.")
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
		videos, err := repository.GetAllVideos()
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
					"Path": v.FilePath,
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
				fmt.Printf("%s\t%s\n", v.VideoID, v.FilePath)
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
		pterm.DefaultSection.Println("Title:", video.Title)
		pterm.DefaultSection.Println("File Path:", video.FilePath)
		pterm.DefaultSection.Println("Rating:", fmt.Sprintf("%.1f", video.Rating))
		pterm.DefaultSection.Println("Duration (seconds):", fmt.Sprintf("%d", video.DurationSeconds))
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

	videoListCmd.Flags().BoolP("json", "j", false, "Output the data in JSON format")
	videoListCmd.Flags().StringP("repository", "r", "", "Specify the repository directory")

	rootCmd.AddCommand(videoCmd)
}
