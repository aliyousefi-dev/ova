package cmd

import (
	"path/filepath"

	"ova-cli/source/internal/repo"

	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

var useBoltDB bool // add a package-level variable to hold the flag value

var initCmd = &cobra.Command{
	Use:   "init [path]",
	Short: "Initialize an ova repository in the specified folder",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		absPath, err := filepath.Abs(args[0])
		if err != nil {
			pterm.Error.Printf("Error resolving absolute path: %v\n", err)
			return
		}

		// Prompt for admin username & password, with default values
		username, err := pterm.DefaultInteractiveTextInput.
			WithDefaultText("user").
			WithMultiLine(false).
			Show("Enter admin username")
		if err != nil {
			pterm.Error.Printf("Failed to read username: %v\n", err)
			return
		}

		password, err := pterm.DefaultInteractiveTextInput.
			WithDefaultText("pass").
			WithMultiLine(false).
			Show("Enter admin password")
		if err != nil {
			pterm.Error.Printf("Failed to read password: %v\n", err)
			return
		}

		repository := repo.NewRepoManager(absPath)

		// No need to call repository.Init() here because CreateRepoWithUser calls it internally
		if err := repository.CreateRepoWithUser(username, password, useBoltDB); err != nil {
			pterm.Error.Printf("Error initializing repository with user: %v\n", err)
			return
		}

		pterm.Success.Println("Initialized empty ova repository.")
		pterm.Println(pterm.LightGreen("Admin user created:"))
		pterm.FgLightGreen.Println("  Username:", username)
		pterm.FgLightGreen.Println("  Password:", password)
	},
}

func InitCommandInit(rootCmd *cobra.Command) {
	// Add a flag to the initCmd to allow selecting boltDB usage
	initCmd.Flags().BoolVar(&useBoltDB, "boltdb", false, "Use BoltDB as data storage backend")

	rootCmd.AddCommand(initCmd)
}
