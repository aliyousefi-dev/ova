package cmd

import (
	"fmt"
	"path/filepath"

	"ova-cli/source/internal/repo"

	"github.com/spf13/cobra"
)

var useBoltDB bool  // flag for using BoltDB
var username string // flag for username
var password string // flag for password

var initCmd = &cobra.Command{
	Use:   "init [path]",
	Short: "Initialize an ova repository in the specified folder",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		absPath, err := filepath.Abs(args[0])
		if err != nil {
			fmt.Printf("Error resolving absolute path: %v\n", err)
			return
		}

		// Prompt for username if not provided
		if username == "" {
			fmt.Print("Enter admin username: ")
			fmt.Scanln(&username)
		}
		// Prompt for password if not provided
		if password == "" {
			fmt.Print("Enter admin password: ")
			fmt.Scanln(&password)
		}

		if username == "" || password == "" {
			fmt.Println("Username and password are required.")
			return
		}

		repository, err := repo.NewRepoManager(absPath)
		if err != nil {
			fmt.Println("Failed to initialize repository:", err)
			return
		}

		// No need to call repository.Init() here because CreateRepoWithUser calls it internally
		if err := repository.CreateRepoWithUser(username, password, useBoltDB); err != nil {
			fmt.Printf("Error initializing repository with user: %v\n", err)
			return
		}

		fmt.Println("Initialized empty ova repository.")
	},
}

func InitCommandInit(rootCmd *cobra.Command) {
	// Add flags for username and password
	initCmd.Flags().StringVar(&username, "user", "", "Admin username")
	initCmd.Flags().StringVar(&password, "pass", "", "Admin password")

	// Add a flag to select boltDB usage
	initCmd.Flags().BoolVar(&useBoltDB, "boltdb", false, "Use BoltDB as data storage backend")

	// Add the initCmd to the root command
	rootCmd.AddCommand(initCmd)
}
