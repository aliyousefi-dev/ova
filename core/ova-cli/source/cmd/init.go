package cmd

import (
	"path/filepath"

	"ova-cli/source/internal/interfaces"
	"ova-cli/source/internal/localstorage"
	"ova-cli/source/internal/repository"

	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

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

		repoPath := filepath.Join(absPath, ".ova-repo")
		storagePath := filepath.Join(repoPath, "storage")

		// Prompt for username (default: user)
		username, _ := pterm.DefaultInteractiveTextInput.
			WithDefaultText("user").
			WithMultiLine(false).
			Show("Enter admin username")

		// Prompt for password (default: pass)
		password, _ := pterm.DefaultInteractiveTextInput.
			WithDefaultText("pass").
			WithMultiLine(false).
			Show("Enter admin password")

		// If user pressed Enter without input, default values are already used.
		var storage interfaces.StorageService = localstorage.NewLocalStorage(storagePath)
		repo := repository.NewRepository(repoPath, storage)

		pterm.Info.Printf("Initializing ova repository at: %s\n", repoPath)

		// Inject credentials into Init
		if err := repo.InitWithUser(username, password); err != nil {
			pterm.Error.Printf("Error initializing repository: %v\n", err)
			return
		}

		pterm.Success.Println("Initialized empty ova repository.")
		pterm.Println(pterm.LightGreen("Admin user created:"))
		pterm.FgLightGreen.Println("  Username:", username)
		pterm.FgLightGreen.Println("  Password:", password)
	},
}

func InitCommandInit(rootCmd *cobra.Command) {
	rootCmd.AddCommand(initCmd)
}
