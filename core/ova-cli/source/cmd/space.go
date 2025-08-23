package cmd

import (
	"fmt"
	"os"
	"ova-cli/source/internal/datatypes"
	"ova-cli/source/internal/repo"
	"path/filepath"

	"github.com/spf13/cobra"
)

// spaceCmd is the root command for managing spaces.
// It serves as a parent command for subcommands related to space operations.
var spaceCmd = &cobra.Command{
	Use:   "space",
	Short: "Manage and debug spaces within the application",
	Run: func(cmd *cobra.Command, args []string) {
		// This will be triggered when no subcommands are provided under `space`
		fmt.Println("Space command invoked: use a subcommand like 'create' to perform operations.")
	},
}

// createSpaceCmd is a subcommand for creating a new space.
// It takes the space name as an argument and outputs confirmation of the space creation.
var createSpaceCmd = &cobra.Command{
	Use:   "create <space-name>",
	Short: "Create a new space with the provided name",
	Args:  cobra.ExactArgs(1), // Ensures exactly one argument is provided (the space name)
	Run: func(cmd *cobra.Command, args []string) {
		// Get the space name from the arguments
		spaceName := args[0]

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

		spaceData := datatypes.CreateDefaultSpaceData(spaceName, "testdebuguser")

		repository.CreateSpace(spaceData)

		// Output the space creation confirmation
		fmt.Printf("Space Created: %s\n", spaceName)
	},
}

var addAllSpacesCmd = &cobra.Command{
	Use:   "addall",
	Short: "scan and index all spaces",
	Run: func(cmd *cobra.Command, args []string) {

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

		repository.ScanAndAddAllSpaces()
	},
}

// InitCommandSpace initializes the space-related commands and adds them to the root command.
func InitCommandSpace(rootCmd *cobra.Command) {
	// Add the root `space` command to the root command
	rootCmd.AddCommand(spaceCmd)
	spaceCmd.AddCommand(addAllSpacesCmd)

	// Add `create` as a subcommand of `space`
	spaceCmd.AddCommand(createSpaceCmd)
}
