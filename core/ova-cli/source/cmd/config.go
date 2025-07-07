package cmd

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"ova-cli/source/internal/repo"

	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

var configCmd = &cobra.Command{
	Use:   "config",
	Short: "Configuration related commands",
}

var configServerCmd = &cobra.Command{
	Use:   "server [host:port]",
	Short: "Set the server host and port in the config",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		address := args[0]

		parts := strings.Split(address, ":")
		if len(parts) != 2 {
			pterm.Error.Println("Invalid address format. Use host:port (e.g., 127.0.0.1:5050)")
			os.Exit(1)
		}

		host := parts[0]
		portStr := parts[1]

		port, err := strconv.Atoi(portStr)
		if err != nil {
			pterm.Error.Printf("Invalid port: %s\n", portStr)
			os.Exit(1)
		}

		// Create RepoManager instance
		repoPath, err := filepath.Abs(".")
		if err != nil {
			pterm.Error.Println("Failed to resolve path:", err)
			os.Exit(1)
		}
		
		repoManager, err := repo.NewRepoManager(repoPath)
		if err != nil {
			fmt.Println("Failed to initialize repository:", err)
			return
		}


		// Load config from disk (or create default if not exists)
		if err := repoManager.LoadRepoConfig(); err != nil {
			pterm.Error.Printf("Failed to load config: %v\n", err)
			os.Exit(1)
		}

		// Update config values
		cfg := repoManager.GetConfigs()
		cfg.ServerHost = host
		cfg.ServerPort = port

		// Save updated config
		if err := repoManager.SaveRepoConfig(cfg); err != nil {
			pterm.Error.Printf("Failed to save config: %v\n", err)
			os.Exit(1)
		}

		pterm.Success.Printf("✅ Server address set to %s:%d\n", host, port)
	},
}

func InitCommandConfig(rootCmd *cobra.Command) {
	rootCmd.AddCommand(configCmd)
	configCmd.AddCommand(configServerCmd)
}
