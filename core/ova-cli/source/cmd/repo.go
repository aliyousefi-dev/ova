package cmd

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"ova-cli/source/internal/interfaces"
	"ova-cli/source/internal/localstorage"
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

// repoSizeCmd shows the total workspace size excluding .ova-repo
var repoSizeCmd = &cobra.Command{
	Use:   "size [path]",
	Short: "Show total workspace size excluding .ova-repo",
	Args:  cobra.MaximumNArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		folderPath := "."
		if len(args) == 1 {
			folderPath = args[0]
		}

		size, err := repository.GetWorkspaceSize(folderPath)
		if err != nil {
			pterm.Error.Printf("Failed to calculate workspace size: %v\n", err)
			os.Exit(1)
		}

		mb := float64(size) / (1024 * 1024)
		gb := float64(size) / (1024 * 1024 * 1024)

		pterm.Info.Printf("Workspace size (excluding .ova-repo): %.2f GB (%.2f MB, %d bytes)\n", gb, mb, size)
	},
}

// GetAllFolders lists all folders under the root path (skipping .ova-server and hidden folders).
func GetAllFolders(root string) ([]string, error) {
	var folders []string

	err := filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil // skip errors
		}
		if info.IsDir() {
			if info.Name() == ".ova-server" || info.Name()[0] == '.' {
				return filepath.SkipDir
			}
			if path != root {
				rel, _ := filepath.Rel(root, path)
				folders = append(folders, rel)
			}
		}
		return nil
	})

	return folders, err
}

// repoFoldersCmd lists all folders in the repository
var repoFoldersCmd = &cobra.Command{
	Use:   "folders [path]",
	Short: "List all folders in the repository (excluding hidden and .ova-server)",
	Args:  cobra.MaximumNArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		root := "."
		if len(args) == 1 {
			root = args[0]
		}

		folders, err := repository.GetAllFolders(root)
		if err != nil {
			pterm.Error.Printf("Error fetching folders: %v\n", err)
			os.Exit(1)
		}

		if len(folders) == 0 {
			pterm.Warning.Println("No folders found.")
			return
		}

		pterm.Info.Printf("Found %d folder(s):\n", len(folders))
		for _, folder := range folders {
			pterm.Info.Printf(" - %s\n", folder)
		}
		pterm.Success.Println("Folder listing completed.")
	},
}

// repoCountCmd shows the total number of video files in the repository and indexed videos count
var repoCountCmd = &cobra.Command{
	Use:   "count [path]",
	Short: "Show total number of video files and indexed videos in the repository",
	Args:  cobra.MaximumNArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		folderPath := "."
		if len(args) == 1 {
			folderPath = args[0]
		}

		// Get total number of video files on disk (repository)
		count, err := repository.GetVideoCountInRepository(folderPath)
		if err != nil {
			pterm.Error.Printf("Failed to count videos in repository: %v\n", err)
			os.Exit(1)
		}

		// Initialize storage at the .ova-repo/storage folder inside the repo path
		storagePath := filepath.Join(folderPath, ".ova-repo", "storage")
		var storage interfaces.StorageService = localstorage.NewLocalStorage(storagePath)

		// Get total indexed videos count from storage
		indexedVideos, err := storage.GetAllVideos()
		if err != nil {
			pterm.Error.Printf("Failed to get indexed videos: %v\n", err)
			os.Exit(1)
		}

		pterm.Info.Printf("Total number of video files: %d\n", count)
		pterm.Info.Printf("Total indexed videos: %d\n", len(indexedVideos))
	},
}

// New command: repoCheckUnindexedCmd
var repoUnindexedCmd = &cobra.Command{
	Use:   "unindexed [path]",
	Short: "List video files on disk that are not indexed in the repository",
	Args:  cobra.MaximumNArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		root := "."
		if len(args) == 1 {
			root = args[0]
		}

		// Initialize storage service at .ova-repo/storage inside root
		storagePath := filepath.Join(root, ".ova-repo", "storage")
		var storage interfaces.StorageService = localstorage.NewLocalStorage(storagePath)

		// Get all indexed videos from storage
		indexedVideos, err := storage.GetAllVideos()
		if err != nil {
			pterm.Error.Printf("Failed to get indexed videos: %v\n", err)
			os.Exit(1)
		}

		// Get unindexed videos on disk
		unindexed, err := repository.GetUnindexedVideos(root, indexedVideos)
		if err != nil {
			pterm.Error.Printf("Failed to get unindexed videos: %v\n", err)
			os.Exit(1)
		}

		if len(unindexed) == 0 {
			pterm.Success.Println("All videos on disk are indexed.")
			return
		}

		pterm.Info.Printf("Found %d unindexed video(s):\n", len(unindexed))
		for _, path := range unindexed {
			fmt.Println(" - " + path)
		}
	},
}

func InitCommandRepo(rootCmd *cobra.Command) {
	rootCmd.AddCommand(repoCmd)

	repoCmd.AddCommand(repoInfoCmd)
	repoCmd.AddCommand(RepoConfigsCmd)
	repoCmd.AddCommand(RepoVersionCmd)
	repoCmd.AddCommand(repoLinksCmd)
	repoCmd.AddCommand(repoPurgeCmd)
	repoCmd.AddCommand(repoSizeCmd)
	repoCmd.AddCommand(repoFoldersCmd)
	repoCmd.AddCommand(repoCountCmd)
	repoCmd.AddCommand(repoUnindexedCmd)
}
