package cmd

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"ova-server/source-code/logs"
	"ova-server/source-code/repository"
	"ova-server/source-code/server"

	"github.com/spf13/cobra"
)

var serveLogger = logs.Loggers("Serve")

var serveCmd = &cobra.Command{
	Use:   "serve",
	Short: "Start the HTTP API server",
	Run: func(cmd *cobra.Command, args []string) {
		cfg, err := repository.LoadRepoConfig(".")
		if err != nil {
			serveLogger.Error("Failed to load config: %v", err)
			os.Exit(1)
		}

		// Get current working directory
		cwd, err := os.Getwd()
		if err != nil {
			serveLogger.Error("Failed to get current working directory: %v", err)
			os.Exit(1)
		}

		// Compute .ova-repo path relative to current folder
		metadataDir := filepath.Join(".", ".ova-repo", "storage")
		addr := cfg.ServerHost + ":" + fmt.Sprint(cfg.ServerPort)

		serveLogger.Info("Starting API server at %s", addr)

		s := server.NewBackendServer(addr, metadataDir, cwd)
		s.Run()
	},
}

// Subcommand: serve:web
var serveWebCmd = &cobra.Command{
	Use:   "serve:web",
	Short: "Start the static Angular web server",
	Run: func(cmd *cobra.Command, args []string) {
		cfg, err := repository.LoadRepoConfig(".")
		if err != nil {
			serveLogger.Error("Failed to load config: %v", err)
			os.Exit(1)
		}

		addr := fmt.Sprintf("%s:%d", cfg.FrontendHost, cfg.FrontendPort)

		exePath, err := os.Executable()
		if err != nil {
			serveLogger.Error("Failed to get executable path: %v", err)
			os.Exit(1)
		}
		exeDir := filepath.Dir(exePath)
		basePath := filepath.Join(exeDir, "frontend", "browser")

		if _, err := os.Stat(basePath); os.IsNotExist(err) {
			serveLogger.Error("Angular build not found at %s. Please build the frontend first.", basePath)
			os.Exit(1)
		}

		serveLogger.Info("Serving static frontend at %s from path %s", addr, basePath)

		web := server.NewWebServer(addr, basePath)
		if err := web.Run(); err != nil {
			serveLogger.Error("Web server error: %v", err)
			os.Exit(1)
		}
	},
}

// Subcommand: serve:all
var serveAllCmd = &cobra.Command{
	Use:   "serve:all",
	Short: "Start both the API backend and Angular frontend servers",
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

		webBasePath := filepath.Join(exeDir, "frontend", "browser")

		if _, err := os.Stat(webBasePath); os.IsNotExist(err) {
			serveLogger.Error("Angular build not found at %s. Please build the frontend first.", webBasePath)
			os.Exit(1)
		}

		apiAddr := fmt.Sprintf("%s:%d", cfg.ServerHost, cfg.ServerPort)
		webAddr := fmt.Sprintf("%s:%d", cfg.FrontendHost, cfg.FrontendPort)
		metadataDir := filepath.Join(".", ".ova-repo", "storage")

		// Write production.json to the frontend config folder
		if err := writeRuntimeConfig(apiAddr, exeDir); err != nil {
			serveLogger.Error("Failed to write runtime config: %v", err)
			os.Exit(1)
		}

		// Start backend server in goroutine
		go func() {
			serveLogger.Info("Starting API server at %s", apiAddr)
			s := server.NewBackendServer(apiAddr, metadataDir, cwd)
			s.Run()
		}()

		// Start web server in main thread
		serveLogger.Info("Starting static frontend at %s from path %s", webAddr, webBasePath)
		web := server.NewWebServer(webAddr, webBasePath)
		if err := web.Run(); err != nil {
			serveLogger.Error("Web server error: %v", err)
			os.Exit(1)
		}
	},
}

func InitCommandServe(rootCmd *cobra.Command) {
	rootCmd.AddCommand(serveCmd)
	rootCmd.AddCommand(serveWebCmd)
	rootCmd.AddCommand(serveAllCmd)
}

func writeRuntimeConfig(backendUrl string, basePath string) error {
	config := map[string]string{
		"APIUrl": "http://" + backendUrl + "/api/v1", // concatenate correctly
	}

	configPath := filepath.Join(basePath, "frontend", "browser", "config", "production.json")

	serveLogger.Info("path is %s", configPath)

	file, err := os.Create(configPath)
	if err != nil {
		return err
	}
	defer file.Close()

	return json.NewEncoder(file).Encode(config)
}
