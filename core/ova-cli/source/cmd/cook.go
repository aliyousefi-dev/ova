package cmd

import (
	"os"
	"ova-cli/source/internal/logs"
	"ova-cli/source/internal/repo"
	"path/filepath"
	"runtime"
	"sync"

	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

var cookLogger = logs.Loggers("cook")

var cookCmd = &cobra.Command{
	Use:   "cook",
	Short: "cook assets",
	Run: func(cmd *cobra.Command, args []string) {
		cookLogger.Info("Video command invoked: use a subcommand (add, list, info, purge)")
	},
}

var cookVTTsCmd = &cobra.Command{
	Use:   "vtts [path|all]",
	Short: "Generate sprite sheet thumbnails and VTT files for one or all videos",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		repoRoot, err := os.Getwd()
		if err != nil {
			pterm.Error.Println("Failed to get working directory:", err)
			return
		}

		repoManager := repo.NewRepoManager(repoRoot)

		arg := args[0]
		var videoPaths []string

		if arg == "all" {
			videoPaths, err = repoManager.ScanDiskForVideos()
			if err != nil || len(videoPaths) == 0 {
				pterm.Warning.Println("No videos found in the repository.")
				return
			}
		} else {
			if _, err := os.Stat(arg); os.IsNotExist(err) {
				pterm.Error.Println("Specified file does not exist.")
				return
			}
			absPath, _ := filepath.Abs(arg)
			videoPaths = append(videoPaths, absPath)
		}

		progressbar, _ := pterm.DefaultProgressbar.WithTotal(len(videoPaths)).Start("Generating VTTs")

		type job struct {
			absPath string
		}

		jobs := make(chan job)
		var wg sync.WaitGroup
		var mu sync.Mutex

		workerCount := runtime.NumCPU()

		worker := func(jobs <-chan job) {
			defer wg.Done()
			for j := range jobs {
				absPath := j.absPath
				fileName := filepath.Base(absPath)

				// Use the repoManager method here:
				err := repoManager.GenerateStoryboardForVideo(absPath)
				mu.Lock()
				if err != nil {
					pterm.Warning.Printf("⚠️ Failed processing %s: %v\n", fileName, err)
				}
				progressbar.Increment()
				mu.Unlock()
			}
		}

		wg.Add(workerCount)
		for i := 0; i < workerCount; i++ {
			go worker(jobs)
		}

		go func() {
			defer close(jobs)
			for _, path := range videoPaths {
				jobs <- job{absPath: path}
			}
		}()

		wg.Wait()
		progressbar.Stop()
		pterm.Success.Println("✅ Sprite sheets and VTT generation complete.")
	},
}

func InitCommandCook(rootCmd *cobra.Command) {
	cookCmd.AddCommand(cookVTTsCmd)

	rootCmd.AddCommand(cookCmd)
}
