package cmd

import (
	"fmt"
	"os"
	"ova-cli/source/internal/repo"

	"github.com/spf13/cobra"
)

// cookAllCmd handles generating VTT files for all videos in the repository
var cookCmd = &cobra.Command{
	Use:   "cook",
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

func InitCommandCook(rootCmd *cobra.Command) {

	rootCmd.AddCommand(cookCmd)
}
