package cmd

import (
	"fmt"
	"os"
	"path/filepath"

	"ova-cli/source/internal/repo"

	"github.com/spf13/cobra"
)

var repoPurgeCmd = &cobra.Command{
	Use:   "purge",
	Short: "Purge repository",
	Run: func(cmd *cobra.Command, args []string) {

		// Get the repository address from the --repository flag
		repoAddress, _ := cmd.Flags().GetString("repository")

		// If repository address is not provided, use the current working directory (os.Getwd())
		if repoAddress == "" {
			repoAddress, _ = os.Getwd() // Default to the current working directory
		}

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

		// Ask for confirmation before purging
		fmt.Print("Are you sure you want to purge the repository? This action cannot be undone. (y/N): ")
		var response string
		fmt.Scanln(&response)
		if response != "y" && response != "Y" {
			fmt.Println("Purge cancelled.")
			return
		}

		if err := repository.PurgeRepository(); err != nil {
			fmt.Println("Failed to purge repository:", err)
			return
		}

	},
}

func InitCommandPurge(rootCmd *cobra.Command) {
	repoPurgeCmd.Flags().StringP("repository", "r", "", "Specify the repository directory")
	rootCmd.AddCommand(repoPurgeCmd)
}
