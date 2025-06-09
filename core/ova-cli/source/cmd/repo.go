package cmd

import (
	"encoding/json"
	"os"

	"ova-cli/source/logs"
	"ova-cli/source/repository"

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

		videos, err := repository.ScanVideos(folderPath)
		if err != nil {
			repoLogger.Error("Error scanning videos: %v", err)
			os.Exit(1)
		}

		videoCount := len(videos)
		repoLogger.Info("Found %d video(s):", videoCount)
		for _, v := range videos {
			repoLogger.Info(" - %s", v)
		}
		repoLogger.Info("Scan completed successfully. %d video(s) found.", videoCount)
	},
}

// repoInfoCmd shows some info about the repo
var repoInfoCmd = &cobra.Command{
	Use:   "info",
	Short: "Show repository info",
	Run: func(cmd *cobra.Command, args []string) {
		cfg, err := repository.LoadRepoConfig(".")
		if err != nil {
			repoLogger.Error("Failed to load config: %v", err)
			os.Exit(1)
		}

		repoLogger.Info("Version: %s", cfg.Version)
		repoLogger.Info("Server Host: %s", cfg.ServerHost)
		repoLogger.Info("Server Port: %d", cfg.ServerPort)
	},
}

// RepoConfigsCmd shows config files
var RepoConfigsCmd = &cobra.Command{
	Use:   "configs",
	Short: "Show configuration files",
	Run: func(cmd *cobra.Command, args []string) {
		cfg, err := repository.LoadRepoConfig(".")
		if err != nil {
			repoLogger.Error("Failed to load config: %v", err)
			os.Exit(1)
		}

		jsonBytes, err := json.MarshalIndent(cfg, "", "  ")
		if err != nil {
			repoLogger.Error("Failed to marshal config to JSON: %v", err)
			os.Exit(1)
		}

		repoLogger.Info("%s", string(jsonBytes))
	},
}

// RepoCheckCmd is the subcommand "check" under "repo"
var RepoCheckCmd = &cobra.Command{
	Use:   "check",
	Short: "Run checks on repository",
	Run: func(cmd *cobra.Command, args []string) {
		repoLogger.Info("Use a subcommand like 'duplicates'")
	},
}

// RepoVersionCmd shows only the repo version
var RepoVersionCmd = &cobra.Command{
	Use:   "version",
	Short: "Show repository version",
	Run: func(cmd *cobra.Command, args []string) {
		cfg, err := repository.LoadRepoConfig(".")
		if err != nil {
			repoLogger.Error("Failed to load config: %v", err)
			os.Exit(1)
		}
		repoLogger.Info("%s", cfg.Version)
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
			repoLogger.Warn(".ova-repo folder does not exist.")
			return
		} else if err != nil {
			repoLogger.Error("Error checking .ova-repo folder: %v", err)
			os.Exit(1)
		}

		if !info.IsDir() {
			repoLogger.Error(".ova-repo exists but is not a directory.")
			os.Exit(1)
		}

		err = os.RemoveAll(repoPath)
		if err != nil {
			repoLogger.Error("Failed to delete .ova-repo folder: %v", err)
			os.Exit(1)
		}

		repoLogger.Info(".ova-repo folder deleted successfully.")
	},
}

func InitCommandRepo(rootCmd *cobra.Command) {
	rootCmd.AddCommand(repoCmd)

	repoCmd.AddCommand(repoInfoCmd)
	repoCmd.AddCommand(RepoConfigsCmd)
	repoCmd.AddCommand(RepoVersionCmd)
	repoCmd.AddCommand(repoLinksCmd)
	repoCmd.AddCommand(repoPurgeCmd)
	repoCmd.AddCommand(RepoCheckCmd)
}
