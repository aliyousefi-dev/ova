package cmd

import (
	"os"
	"path/filepath"
	"strconv"

	"ova-server/source-code/logs"
	"ova-server/source-code/repository"
	"ova-server/source-code/server"

	"github.com/spf13/cobra"
)

var watchLogger = logs.Loggers("Watch")

var watchCmd = &cobra.Command{
	Use:   "watch",
	Short: "Start the HTTP API server",
	Run: func(cmd *cobra.Command, args []string) {
		cfg, err := repository.LoadRepoConfig(".") // Load from current folder or upward
		if err != nil {
			watchLogger.Error("Failed to load config: %v", err)
			return
		}

		cwd, err := os.Getwd()
		if err != nil {
			watchLogger.Error("Failed to get current working directory: %v", err)
			return
		}

		metadataDir := filepath.Join(".", ".ova-repo", "storage")
		addr := cfg.ServerHost + ":" + strconv.Itoa(cfg.ServerPort)

		s := server.NewBackendServer(addr, metadataDir, cwd)
		s.Run()
	},
}

func InitCommandWatch(rootCmd *cobra.Command) {
	rootCmd.AddCommand(watchCmd)
}
