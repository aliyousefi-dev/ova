package cmd

import (
	"fmt"
	"os"
	"path/filepath"

	"ova-server/source-code/logs"
	"ova-server/source-code/repository"
	"ova-server/source-code/server"

	"github.com/spf13/cobra"
)

var serveLogger = logs.Loggers("Serve")
var serveBackendOnly bool // --backend flag
var serveDisableAuth bool // --noauth flag to disable authentication

var serveCmd = &cobra.Command{
	Use:   "serve",
	Short: "Start the backend API server (optionally with frontend)",
	Run: func(cmd *cobra.Command, args []string) {
		cfg, err := repository.LoadRepoConfig(".")
		if err != nil {
			serveLogger.Error("Failed to load config: %v", err)
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

		metadataDir := filepath.Join(".", ".ova-repo", "storage")
		addr := fmt.Sprintf("%s:%d", cfg.ServerHost, cfg.ServerPort)

		frontendPath := filepath.Join(exeDir, "frontend", "browser")
		serveFrontend := false

		if !serveBackendOnly {
			if _, err := os.Stat(frontendPath); err == nil {
				serveFrontend = true
				serveLogger.Info("Serving frontend from %s", frontendPath)
			} else {
				serveLogger.Warn("Frontend build not found at %s. Only backend will be served.", frontendPath)
			}
		} else {
			serveLogger.Info("Backend only mode enabled. Frontend will not be served.")
		}

		serveLogger.Info("Starting API server at %s", addr)
		s := server.NewBackendServer(addr, metadataDir, cwd, serveFrontend, frontendPath, serveDisableAuth)
		s.Run()
	},
}

func InitCommandServe(rootCmd *cobra.Command) {
	serveCmd.Flags().BoolVarP(&serveBackendOnly, "backend", "b", false, "Serve backend API only (no frontend)")
	serveCmd.Flags().BoolVar(&serveDisableAuth, "noauth", false, "Disable authentication (for testing only)")
	rootCmd.AddCommand(serveCmd)
}
