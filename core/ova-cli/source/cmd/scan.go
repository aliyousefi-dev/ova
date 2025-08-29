package cmd

import (
	"fmt"
	"os"
	"ova-cli/source/internal/repo"
	"path/filepath"

	"github.com/spf13/cobra"
)

var scanCmd = &cobra.Command{
	Use:   "scan",
	Short: "Scan a repository",
	Run: func(cmd *cobra.Command, args []string) {

		totalVideos := 0
		indexedVideos := 0
		cookedVideos := 0
		issueVideos := 0
		storageUsed := ""

		repoAddress, _ := os.Getwd() // Default to current working directory if no flag is provided

		// Resolve the absolute path of the repository
		absPath, err := filepath.Abs(repoAddress)
		if err != nil {
			fmt.Printf("Error resolving absolute path: %v\n", err)
			return
		}

		// Create a new RepoManager instance
		repository, err := repo.NewRepoManager(absPath)
		if err != nil {
			fmt.Println("Failed to initialize repository:", err)
			return
		}

		totalVideos, _ = repository.GetTotalVideoCountOnRepository()
		indexedVideos, _ = repository.GetTotalIndexedVideoCount()
		cookedVideos = repository.GetTotalVideoCooked()
		repoSize, _ := repository.GetRepoSize()

		storageUsed = formatSize(repoSize)

		fmt.Printf("Scanning repository...\n")
		fmt.Printf("total videos founded: %d\n", totalVideos)
		fmt.Printf("total indexed videos: %d\n", indexedVideos)
		fmt.Printf("total cooked videos: %d\n", cookedVideos)
		fmt.Printf("total issue videos: %d\n", issueVideos)
		fmt.Printf("disk usage: %s\n", storageUsed)

	},
}

func InitCommandScan(rootCmd *cobra.Command) {
	rootCmd.AddCommand(scanCmd)
}

// formatSize formats the size in bytes to a human-readable string (e.g., 50 MB, 1 GB)
func formatSize(size int64) string {
	const (
		_  = iota
		KB = 1 << (10 * iota)
		MB
		GB
		TB
	)

	switch {
	case size >= TB:
		return fmt.Sprintf("%.2f TB", float64(size)/TB)
	case size >= GB:
		return fmt.Sprintf("%.2f GB", float64(size)/GB)
	case size >= MB:
		return fmt.Sprintf("%.2f MB", float64(size)/MB)
	case size >= KB:
		return fmt.Sprintf("%.2f KB", float64(size)/KB)
	default:
		return fmt.Sprintf("%d B", size)
	}
}
