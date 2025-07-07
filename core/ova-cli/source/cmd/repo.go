package cmd

import (
	"encoding/json"
	"fmt"
	"os"
	"ova-cli/source/internal/repo"
	"path/filepath"

	"github.com/spf13/cobra"
)

var repoCmd = &cobra.Command{
	Use:   "repo info [path]",
	Short: "Get information about the repository, including video count, user count, storage used, last updated time, host, and port",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		// Get the repository address from the --repository flag
		repoAddress, _ := cmd.Flags().GetString("repository")

		// If repository address is not provided, use the current working directory
		if repoAddress == "" {
			repoAddress, _ = os.Getwd()
		}

		// Resolve the absolute path of the repository
		absPath, err := filepath.Abs(repoAddress)
		if err != nil {
			fmt.Printf("Error resolving absolute path: %v\n", err)
			return
		}

		// Create a new RepoManager instance
		repository := repo.NewRepoManager(absPath)
		if err := repository.Init(); err != nil {
			fmt.Printf("Error initializing repository: %v\n", err)
			return
		}

		// Fetch the repository info using the GetRepoInfo method
		repoInfo, err := repository.GetRepoInfo()
		if err != nil {
			fmt.Printf("Error fetching repository info: %v\n", err)
			return
		}

		// Check if --json flag is set
		jsonFlag, _ := cmd.Flags().GetBool("json")
		if jsonFlag {
			// If --json is passed, return data in JSON format
			jsonData, err := json.Marshal(repoInfo)
			if err != nil {
				fmt.Printf("Error marshaling repo info to JSON: %v\n", err)
				return
			}

			// Print the JSON output
			fmt.Println(string(jsonData))
		} else {
			// If no --json flag is passed, display data in a human-readable format
			fmt.Println("Repository Information:")
			fmt.Printf("  Repository Address: %s\n", absPath)
			fmt.Printf("  Total Videos: %d\n", repoInfo.VideoCount)
			fmt.Printf("  Total Users: %d\n", repoInfo.UserCount)
			fmt.Printf("  Storage Used: %s\n", repoInfo.StorageUsed)
			fmt.Printf("  Created At: %s\n", repoInfo.CreatedAt)
			fmt.Printf("  Host: %s\n", repoInfo.Host)
			fmt.Printf("  Port: %d\n", repoInfo.Port)
		}
	},
}

func InitCommandRepo(rootCmd *cobra.Command) {
	// Add flags like in videoListCmd
	repoCmd.Flags().BoolP("json", "j", false, "Output the repository information in JSON format")
	repoCmd.Flags().StringP("repository", "r", "", "Specify the repository directory")

	// Add the repoCmd to the root command
	rootCmd.AddCommand(repoCmd)
}
