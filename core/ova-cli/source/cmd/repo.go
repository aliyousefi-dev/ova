package cmd

import (
	"encoding/json"
	"fmt"
	"os"
	"ova-cli/source/internal/repo"
	"path/filepath"

	"github.com/spf13/cobra"
)

// root repo command
var repoCmd = &cobra.Command{
	Use:   "repo",
	Short: "Manage the repository",
	Long:  "This command allows you to interact with the repository, get info, and list videos.",
}

// Subcommand to get repository info
var repoInfoCmd = &cobra.Command{
	Use:   "info",
	Short: "Get information about the repository, including video count, user count, storage used, last updated time, host, and port",
	Args:  cobra.NoArgs, // No arguments required now
	Run: func(cmd *cobra.Command, args []string) {
		// Get the repository address from the --repository flag
		repoAddress, _ := cmd.Flags().GetString("repository")

		// If repository address is not provided, use the current working directory
		if repoAddress == "" {
			repoAddress, _ = os.Getwd() // Default to current working directory if no flag is provided
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



var repoVideosCmd = &cobra.Command{
	Use:   "videos",
	Short: "Scan the repository for videos and list their paths",
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
		repository := repo.NewRepoManager(absPath)
		if err := repository.Init(); err != nil {
			fmt.Printf("Error initializing repository: %v\n", err)
			return
		}

		// Fetch videos from repository by scanning the disk
		videos, err := repository.ScanDiskForVideosRelPath()
		if err != nil {
			fmt.Printf("Error scanning for videos: %v\n", err)
			return
		}

		// Check if --json flag is set
		jsonFlag, _ := cmd.Flags().GetBool("json")
		if jsonFlag {
			// If --json is passed, return data in JSON format
			videoData := make([]map[string]string, len(videos))
			for i, video := range videos {
				videoData[i] = map[string]string{
					"Video Path": video,
				}
			}

			// Marshal the video data into JSON format
			jsonData, err := json.Marshal(videoData)
			if err != nil {
				fmt.Println("Failed to marshal video data to JSON:", err)
				return
			}

			// Print the JSON output
			fmt.Println(string(jsonData))
		} else {
			// If no --json flag is passed, display data in table format
			if len(videos) == 0 {
				fmt.Println("No videos found.")
			} else {
				fmt.Println("Video Paths:")
				for _, video := range videos {
					fmt.Println(video)
				}
			}
		}
	},
}

var repoUnindexedCmd = &cobra.Command{
	Use:   "unindexed",  // Shortened the command name
	Short: "List unindexed videos in the repository",
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
		repository := repo.NewRepoManager(absPath)
		if err := repository.Init(); err != nil {
			fmt.Printf("Error initializing repository: %v\n", err)
			return
		}

		// Fetch unindexed videos from the repository
		unindexedVideos, err := repository.GetUnindexedVideos()
		if err != nil {
			fmt.Printf("Error fetching unindexed videos: %v\n", err)
			return
		}

		// Check if --json flag is set
		jsonFlag, _ := cmd.Flags().GetBool("json")
		if jsonFlag {
			// If --json is passed, return data in JSON format
			videoData := make([]map[string]string, len(unindexedVideos))
			for i, video := range unindexedVideos {
				videoData[i] = map[string]string{
					"Video Path": video,
				}
			}

			// Marshal the video data into JSON format
			jsonData, err := json.Marshal(videoData)
			if err != nil {
				fmt.Println("Failed to marshal video data to JSON:", err)
				return
			}

			// Print the JSON output
			fmt.Println(string(jsonData))
		} else {
			// If no --json flag is passed, display data in a human-readable format
			if len(unindexedVideos) == 0 {
				fmt.Println("No unindexed videos found.")
			} else {
				fmt.Println("Unindexed Video Paths:")
				for _, video := range unindexedVideos {
					fmt.Println(video)
				}
			}
		}
	},
}


func InitCommandRepo(rootCmd *cobra.Command) {
	// Add flags for the repo info and videos commands
	repoInfoCmd.Flags().BoolP("json", "j", false, "Output the repository information in JSON format")
	repoInfoCmd.Flags().StringP("repository", "r", "", "Specify the repository directory")

	// Add flags for the unindexed command
	repoUnindexedCmd.Flags().BoolP("json", "j", false, "Output the unindexed video paths in JSON format")
	repoUnindexedCmd.Flags().StringP("repository", "r", "", "Specify the repository directory")

		
	repoVideosCmd.Flags().BoolP("json", "j", false, "Output the video paths in JSON format")
	repoVideosCmd.Flags().StringP("repository", "r", "", "Specify the repository directory")

	// Add the subcommands to the root repo command
	repoCmd.AddCommand(repoInfoCmd)
	repoCmd.AddCommand(repoVideosCmd)
	repoCmd.AddCommand(repoUnindexedCmd)

	// Add the repoCmd to the root command (which could be `rootCmd`)
	rootCmd.AddCommand(repoCmd)
}
