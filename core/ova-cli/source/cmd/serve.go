package cmd

import (
	"fmt"
	"os"
	"path/filepath"

	"ova-cli/source/internal/logs"
	"ova-cli/source/internal/repo"
	"ova-cli/source/internal/server"
	"ova-cli/source/internal/utils"

	"github.com/spf13/cobra"
)

var serveLogger = logs.Loggers("Serve")
var serveBackendOnly bool
var serveDisableAuth bool
var serveUseHttps bool

// Version of the UI, which you can set dynamically or statically
var ovaUIVersion = "0.1.0"



var serveCmd = &cobra.Command{
	Use:   "serve <repo-path>",
	Short: "Start the backend API server (optionally with web)",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		repoPath := args[0]

		// Initialize RepoManager with config and storage
		repository := repo.NewRepoManager(repoPath)
		if err := repository.Init(); err != nil {
			serveLogger.Error("Failed to initialize repository at %s: %v", repoPath, err)
			os.Exit(1)
		}

		cfg := repository.GetConfigs()

		// Determine current directory and executable path
		cwd, err := os.Getwd()
		if err != nil {
			serveLogger.Error("Failed to get current working directory: %v", err)
			os.Exit(1)
		}
		exePath, err := os.Executable()
		if err != nil {
			serveLogger.Error("Failed to get executable path: %v", err)
			os.Exit(1)
		}
		exeDir := filepath.Dir(exePath)

		// Server address
		addr := fmt.Sprintf("%s:%d", cfg.ServerHost, cfg.ServerPort)

		// Web UI check
		webPath := filepath.Join(exeDir, fmt.Sprintf("ovaui-%s", ovaUIVersion))
		serveweb := false
		if !serveBackendOnly {
			if _, err := os.Stat(webPath); err == nil {
				serveweb = true
				serveLogger.Info("Serving web at %s", addr)
			} else {
				serveLogger.Warn("Web build not found at %s. Only backend will be served.", webPath)
			}
		} else {
			serveLogger.Info("Backend-only mode enabled. Web will not be served.")
		}

		serveLogger.Info("Serving API at %s/api/v1/", addr)

		// Print local IPs
		localIPs, err := utils.GetLocalIPs()
		if err != nil {
			serveLogger.Warn("Could not determine local IP addresses: %v", err)
		} else {
			for _, ip := range localIPs {
				serveLogger.Info("Server reachable at http://%s:%d/", ip, cfg.ServerPort)
			}
		}

		// Launch server
		serverInstance := server.NewBackendServer(
			repository,
			addr,
			exeDir,
			cwd,
			serveweb,
			webPath,
			serveDisableAuth,
			serveUseHttps,
		)

		if err := serverInstance.Run(); err != nil {
			serveLogger.Error("Server failed to start: %v", err)
			os.Exit(1)
		}
	},
}

func InitCommandServe(rootCmd *cobra.Command) {
	serveCmd.Flags().BoolVarP(&serveBackendOnly, "backend", "b", false, "Serve backend API only (no web)")
	serveCmd.Flags().BoolVar(&serveDisableAuth, "noauth", false, "Disable authentication (for testing only)")
	serveCmd.Flags().BoolVar(&serveUseHttps, "https", false, "Enable HTTPS (default is HTTP)")
	rootCmd.AddCommand(serveCmd)
}
