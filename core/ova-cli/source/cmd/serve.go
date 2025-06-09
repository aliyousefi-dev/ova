package cmd

import (
	"fmt"
	"os"
	"path/filepath"

	"ova-cli/source/logs"
	"ova-cli/source/repository"
	"ova-cli/source/server"

	"github.com/spf13/cobra"
)

var serveLogger = logs.Loggers("Serve")
var serveBackendOnly bool
var serveDisableAuth bool
var serveUseHttps bool

var serveCmd = &cobra.Command{
	Use:   "serve <repo-path>",
	Short: "Start the backend API server (optionally with web)",
	Args:  cobra.ExactArgs(1), // Expect exactly one argument: the repo path
	Run: func(cmd *cobra.Command, args []string) {
		repoPath := args[0]

		cfg, err := repository.LoadRepoConfig(repoPath)
		if err != nil {
			serveLogger.Error("Failed to load config from %s: %v", repoPath, err)
			os.Exit(1)
		}

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

		metadataDir := filepath.Join(repoPath, ".ova-repo", "storage")
		addr := fmt.Sprintf("%s:%d", cfg.ServerHost, cfg.ServerPort)

		webPath := filepath.Join(exeDir, "web", "browser")
		serveweb := false

		if !serveBackendOnly {
			if _, err := os.Stat(webPath); err == nil {
				serveweb = true
				serveLogger.Info("Serving web at %s", addr)
			} else {
				serveLogger.Warn("web build not found at %s. Only backend will be served.", webPath)
			}
		} else {
			serveLogger.Info("Backend only mode enabled. web will not be served.")
		}

		serveLogger.Info("Serving API at %s/api/v1/", addr)
		s := server.NewBackendServer(addr, exeDir, metadataDir, cwd, serveweb, webPath, serveDisableAuth, serveUseHttps)

		if err := s.Run(); err != nil {
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
