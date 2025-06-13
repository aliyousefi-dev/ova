package cmd

import (
	"encoding/json"
	"os"

	"ova-cli/source/internal/logs"
	"ova-cli/source/internal/repository"

	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

var repoLogger = logs.Loggers("Repo")

// repoCmd is the parent command: "repo"
var repoCmd = &cobra.Command{
	Use:   "repo",
	Short: "Repository related commands",
	Run: func(cmd *cobra.Command, args []string) {
		repoLogger.Info("Use a subcommand like 'show' or 'check'")
	},
}

// repoLinksCmd is the "links" command under "repo show"
var repoLinksCmd = &cobra.Command{
	Use:   "links [path]",
	Short: "Show files in the repository folder (default: current folder)",
	Args:  cobra.MaximumNArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		folderPath := "."
		if len(args) == 1 {
			folderPath = args[0]
		}

		videos, err := repository.GetAllVideoPaths(folderPath)
		if err != nil {
			pterm.Error.Printf("Error scanning videos: %v\n", err)
			os.Exit(1)
		}

		videoCount := len(videos)
		pterm.Info.Printf("Found %d video(s):\n", videoCount)
		for _, v := range videos {
			pterm.Info.Printf(" - %s\n", v)
		}
		pterm.Success.Printf("Scan completed successfully. %d video(s) found.\n", videoCount)
	},
}

// repoInfoCmd shows some info about the repo
var repoInfoCmd = &cobra.Command{
	Use:   "info",
	Short: "Show repository info",
	Run: func(cmd *cobra.Command, args []string) {
		cfg, err := repository.LoadRepoConfig(".")
		if err != nil {
			pterm.Error.Printf("Failed to load config: %v\n", err)
			os.Exit(1)
		}

		pterm.Info.Printf("Version: %s\n", cfg.Version)
		pterm.Info.Printf("Server Host: %s\n", cfg.ServerHost)
		pterm.Info.Printf("Server Port: %d\n", cfg.ServerPort)
	},
}

// RepoConfigsCmd shows config files
var RepoConfigsCmd = &cobra.Command{
	Use:   "configs",
	Short: "Show configuration files",
	Run: func(cmd *cobra.Command, args []string) {
		cfg, err := repository.LoadRepoConfig(".")
		if err != nil {
			pterm.Error.Printf("Failed to load config: %v\n", err)
			os.Exit(1)
		}

		jsonBytes, err := json.MarshalIndent(cfg, "", "  ")
		if err != nil {
			pterm.Error.Printf("Failed to marshal config to JSON: %v\n", err)
			os.Exit(1)
		}

		pterm.Info.Println(string(jsonBytes))
	},
}

// RepoVersionCmd shows only the repo version
var RepoVersionCmd = &cobra.Command{
	Use:   "version",
	Short: "Show repository version",
	Run: func(cmd *cobra.Command, args []string) {
		cfg, err := repository.LoadRepoConfig(".")
		if err != nil {
			pterm.Error.Printf("Failed to load config: %v\n", err)
			os.Exit(1)
		}
		pterm.Info.Println(cfg.Version)
	},
}

// repoPurgeCmd deletes the .ova-repo folder
// repoPurgeCmd deletes the .ova-repo folder
var repoPurgeCmd = &cobra.Command{
	Use:   "purge",
	Short: "Delete the .ova-repo folder",
	Run: func(cmd *cobra.Command, args []string) {
		repoPath := ".ova-repo"

		info, err := os.Stat(repoPath)
		if os.IsNotExist(err) {
			pterm.Warning.Println(".ova-repo folder does not exist.")
			return
		} else if err != nil {
			pterm.Error.Printf("Error checking .ova-repo folder: %v\n", err)
			os.Exit(1)
		}

		if !info.IsDir() {
			pterm.Error.Println(".ova-repo exists but is not a directory.")
			os.Exit(1)
		}

		err = os.RemoveAll(repoPath)
		if err != nil {
			pterm.Error.Printf("Failed to delete .ova-repo folder: %v\n", err)
			os.Exit(1)
		}

		pterm.Success.Println(".ova-repo folder deleted successfully.")
	},
}

func InitCommandRepo(rootCmd *cobra.Command) {
	rootCmd.AddCommand(repoCmd)

	repoCmd.AddCommand(repoInfoCmd)
	repoCmd.AddCommand(RepoConfigsCmd)
	repoCmd.AddCommand(RepoVersionCmd)
	repoCmd.AddCommand(repoLinksCmd)
	repoCmd.AddCommand(repoPurgeCmd)
}
