package cmd

import (
	"fmt"
	"os"
	"ova-cli/source/internal/logs"
	"ova-cli/source/internal/repo"
	"path/filepath"

	"github.com/spf13/cobra"
)

var cookLogger = logs.Loggers("cook")

var cookCmd = &cobra.Command{
	Use:   "cook",
	Short: "Cook assets",
	Run: func(cmd *cobra.Command, args []string) {
		cookLogger.Info("Cook command invoked: use a subcommand (all, path)")
	},
}

// cookAllCmd handles generating VTT files for all videos in the repository
var cookAllCmd = &cobra.Command{
	Use:   "all",
	Short: "Generate VTT files for all videos in the repository",
	Run: func(cmd *cobra.Command, args []string) {
		repoRoot, err := os.Getwd()
		if err != nil {
			fmt.Println("Failed to get working directory:", err)
			return
		}

		repoManager, err := repo.NewRepoManager(repoRoot)
		if err != nil {
			fmt.Println("Failed to initialize repository:", err)
			return
		}

		// Scan for all video paths
		videoPaths, err := repoManager.ScanDiskForVideos()
		if err != nil || len(videoPaths) == 0 {
			fmt.Println("No videos found in the repository.")
			return
		}

		progressChan := make(chan int)
		errorChan := make(chan error)

		go func() {
			for progress := range progressChan {
				fmt.Printf("\rProgress: %d%%", progress) // Update progress in place
			}
		}()

		go func() {
			for err := range errorChan {
				fmt.Printf("\nCooking Error: %v\n", err)
			}
		}()

		// Use the new CookMultiVideos method
		_ = repoManager.CookMultiVideos(videoPaths, progressChan, errorChan)

		// Print completion message
		fmt.Println("\n✅ Sprite sheets and VTT generation complete.")
	},
}

// cookPathCmd handles generating VTT files for a specific video at the given path
var cookPathCmd = &cobra.Command{
	Use:   "path [path]",
	Short: "Generate VTT files for a specific video at the given path",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		repoRoot, err := os.Getwd()
		if err != nil {
			fmt.Println("Failed to get working directory:", err)
			return
		}

		repoManager, err := repo.NewRepoManager(repoRoot)
		if err != nil {
			fmt.Println("Failed to initialize repository:", err)
			return
		}

		arg := args[0]
		if _, err := os.Stat(arg); os.IsNotExist(err) {
			fmt.Println("Specified file does not exist.")
			return
		}
		absPath, _ := filepath.Abs(arg)

		// Use CookOneVideo method for a single video
		err = repoManager.CookOneVideo(absPath)
		if err != nil {
			fmt.Println("Failed to cook video:", err)
			return
		}

		fmt.Printf("\n✅ Sprite sheets and VTT generation complete for: %s\n", absPath)
	},
}

func InitCommandCook(rootCmd *cobra.Command) {
	cookCmd.AddCommand(cookAllCmd)
	cookCmd.AddCommand(cookPathCmd)

	rootCmd.AddCommand(cookCmd)
}
