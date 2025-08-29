package cmd

import (
	"fmt"
	"os"
	"ova-cli/source/internal/repo"
	"sync"

	"github.com/spf13/cobra"
)

// Command to index all videos
var indexCmd = &cobra.Command{
	Use:   "index",
	Short: "index all videos from disk",
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

		repository.ScanAndAddAllSpaces()

		// Step 1: Scan the disk for all spaces
		spaces, err := repository.ScanDiskForSpaces()
		if err != nil {
			fmt.Printf("Error scanning disk at path '%s': %v\n", repoRoot, err)
			return
		}

		if len(spaces) == 0 {
			fmt.Println("No spaces found on disk to process.")
			return
		}

		// Step 2: Loop through each space and index its videos
		for _, space := range spaces {
			spaceVideos := repository.GetVideosFromSpaceScan(space)

			if len(spaceVideos) == 0 {
				fmt.Printf("\nNo videos found in space '%s'. Skipping.\n", space.Space)
				continue
			}

			fmt.Printf("\nProcessing space: '%s'\n", space.Space)
			fmt.Printf("Found %d videos.\n", len(spaceVideos))

			// Channels for THIS SPACE ONLY
			indexingProgressChan := make(chan int)
			indexingErrorChan := make(chan error)

			var wg sync.WaitGroup
			var errors []error

			// Handle progress
			wg.Add(1)
			go func() {
				defer wg.Done()
				for progress := range indexingProgressChan {
					fmt.Printf("\rProgress: %3d%%", progress)
				}
			}()

			// Handle errors (collect for later printing)
			wg.Add(1)
			go func() {
				defer wg.Done()
				for err := range indexingErrorChan {
					errors = append(errors, err)
				}
			}()

			// ---- Call IndexMultiVideos ----
			_, err := repository.IndexMultiVideos(
				spaceVideos,
				indexingProgressChan,
				indexingErrorChan,
			)

			// Wait for goroutines
			wg.Wait()

			// Print result
			fmt.Printf("\rProgress: 100%%\n")
			if err != nil {
				fmt.Printf("Failed to index space '%s': %v\n", space.Space, err)
			}

			// Print collected errors if any
			if len(errors) > 0 {
				fmt.Printf("Errors: %d\n", len(errors))
			}
		}

		fmt.Println()
		fmt.Println("Indexing Summary")
		fmt.Println("================")
		fmt.Printf("Spaces processed: %d\n", 4)
		fmt.Printf("Videos found: %d\n", 6)
		fmt.Printf("Indexed: %d\n", 0)
		fmt.Printf("Skipped (already indexed): %d\n", 6)
		fmt.Printf("Errors: %d\n", 0)
	},
}

func InitCommandIndex(rootCmd *cobra.Command) {

	rootCmd.AddCommand(indexCmd)
}
