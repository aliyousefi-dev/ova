package cmd

import (
	"ova-cli/logs"

	"github.com/spf13/cobra"
)

// Version represents the version of your application
const Version = "1.0.0-beta"

var versionLogger = logs.Loggers("Version")

var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Print the version number of gate-platform application",
	Run: func(cmd *cobra.Command, args []string) {
		versionLogger.Info("ova-server %s", Version)
	},
}

func InitCommandVersion(rootCmd *cobra.Command) {
	rootCmd.AddCommand(versionCmd)
}
