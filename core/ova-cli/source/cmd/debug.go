package cmd

import (
	"ova-cli/source/internal/filehash"
	"ova-cli/source/internal/logs"

	"github.com/spf13/cobra"
)

var debugLogger = logs.Loggers("Debug")

// root debug command
var debugCmd = &cobra.Command{
	Use:   "debug",
	Short: "Debugging related commands",
}

// hash command under debug
var debugHashCmd = &cobra.Command{
	Use:   "hash",
	Short: "Hash related debugging commands",
}

// debug hash video <video-path>
var debugHashVideoCmd = &cobra.Command{
	Use:   "video <video-path>",
	Short: "Generate hash for a single video file",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		path := args[0]
		hash, err := filehash.ComputeFileHash(path)
		if err != nil {
			debugLogger.Error("Failed to hash file: %v", err)
			return
		}
		debugLogger.Info("File: %s", path)
		debugLogger.Info("Hash: %s", hash)
	},
}

// InitCommandDebug initializes the debug command and its subcommands
func InitCommandDebug(rootCmd *cobra.Command) {
	rootCmd.AddCommand(debugCmd)
	debugCmd.AddCommand(debugHashCmd)
	debugHashCmd.AddCommand(debugHashVideoCmd)

}
