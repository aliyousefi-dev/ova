package cmd

import (
	"encoding/json"
	"ova-cli/source/filehash"
	"ova-cli/source/logs"

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

// debug hash repo <root-path> scans folder and generates hash collection JSON
var debugHashRepoCmd = &cobra.Command{
	Use:   "repo <root-path>",
	Short: "Scan folder and generate hash collection JSON",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		root := args[0]
		collection, err := filehash.GenerateHashCollection(root)
		if err != nil {
			debugLogger.Error("Failed to generate hash collection: %v", err)
			return
		}

		data, err := json.MarshalIndent(collection, "", "  ")
		if err != nil {
			debugLogger.Error("Failed to marshal collection to JSON: %v", err)
			return
		}

		debugLogger.Info("Hash collection JSON:\n%s", string(data))
	},
}

// debug hash dup <root-path> scans folder, finds duplicates by hash, and reports them
var debugHashDuplicatesCmd = &cobra.Command{
	Use:   "duplicates <root-path>",
	Short: "Scan folder and print duplicate files based on hashes",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		root := args[0]

		// Generate hash collection (slice of FileInfo)
		collection, err := filehash.GenerateHashCollection(root)
		if err != nil {
			debugLogger.Error("Failed to generate hash collection: %v", err)
			return
		}

		// Map from hash string to list of file paths
		duplicates := make(map[string][]string)

		// Iterate over the slice
		for _, fileInfo := range collection {
			hash := fileInfo.Hash
			filePath := fileInfo.Path
			duplicates[hash] = append(duplicates[hash], filePath)
		}

		// Print only hashes that have duplicates (more than 1 file path)
		for hash, paths := range duplicates {
			if len(paths) > 1 {
				debugLogger.Info("Duplicate hash: %s", hash)
				for _, p := range paths {
					debugLogger.Info("  - %s", p)
				}
			}
		}
	},
}

// InitCommandDebug initializes the debug command and its subcommands
func InitCommandDebug(rootCmd *cobra.Command) {
	rootCmd.AddCommand(debugCmd)
	debugCmd.AddCommand(debugHashCmd)
	debugHashCmd.AddCommand(debugHashVideoCmd)
	debugHashCmd.AddCommand(debugHashRepoCmd)
	debugHashCmd.AddCommand(debugHashDuplicatesCmd)

}
