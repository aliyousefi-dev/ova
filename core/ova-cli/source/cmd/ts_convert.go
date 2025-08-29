package cmd

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"ova-cli/source/internal/logs"
	"ova-cli/source/internal/thirdparty"

	"github.com/spf13/cobra"
)

var tsConvertLogger = logs.Loggers("TsConvert")

// recursive flag
var recursive bool

// tsconvert command
var tsConvertCmd = &cobra.Command{
	Use:   "tsconvert [file.ts]",
	Short: "Convert .ts video(s) to MP4 format",
	Args:  cobra.MaximumNArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		if recursive {
			// Scan current folder & subdirectories
			err := filepath.Walk(".", func(path string, info os.FileInfo, err error) error {
				if err != nil {
					return err
				}
				if !info.IsDir() && strings.HasSuffix(strings.ToLower(info.Name()), ".ts") {
					convertFile(path)
				}
				return nil
			})
			if err != nil {
				tsConvertLogger.Error("Failed to scan directories: %v", err)
			}
			return
		}

		if len(args) == 0 {
			tsConvertLogger.Error("Please provide a .ts file or use --recursive")
			return
		}

		convertFile(args[0])
	},
}

// convertFile handles a single .ts → .mp4 conversion
func convertFile(inputPath string) {
	ext := filepath.Ext(inputPath)
	if strings.ToLower(ext) != ".ts" {
		tsConvertLogger.Error("File is not a .ts: %s", inputPath)
		return
	}

	outputPath := strings.TrimSuffix(inputPath, ext) + ".mp4"

	err := thirdparty.ConvertToMP4(inputPath, outputPath)
	if err != nil {
		tsConvertLogger.Error("Failed to convert %s: %v", inputPath, err)
		return
	}

	tsConvertLogger.Info("Converted: %s → %s", inputPath, outputPath)
	fmt.Println(outputPath) // for scripting
}

// InitCommandTsConvert initializes the tsconvert command
func InitCommandTsConvert(rootCmd *cobra.Command) {
	tsConvertCmd.Flags().BoolVarP(&recursive, "recursive", "r", false, "Scan current folder and subdirectories for .ts files")
	rootCmd.AddCommand(tsConvertCmd)
}
