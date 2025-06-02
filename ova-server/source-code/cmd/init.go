package cmd

import (
	"path/filepath"

	"ova-server/source-code/logs"
	"ova-server/source-code/repository"

	"github.com/spf13/cobra"
)

var initLogger = logs.Loggers("Init")

var initCmd = &cobra.Command{
	Use:   "init [path]",
	Short: "Initialize an ova repository in the specified folder",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		absPath, err := filepath.Abs(args[0])
		if err != nil {
			initLogger.Error("Error resolving absolute path: %v", err)
		}

		repo := repository.NewRepository(absPath)
		if err := repo.Init(); err != nil {
			initLogger.Error("Error initializing repository: %v", err)
		}

		initLogger.Info("Initialized empty ova repository with default admin user at: %s", absPath)
	},
}

func InitCommandInit(rootCmd *cobra.Command) {
	rootCmd.AddCommand(initCmd)
}
