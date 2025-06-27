package cmd

import (
	"os"
	"ova-cli/source/internal/filehash"
	"ova-cli/source/internal/logs"
	"ova-cli/source/internal/repository"
	"ova-cli/source/internal/thirdparty"
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

		repoPath := filepath.Join(repoRoot, ".ova-repo")
		storageDir := filepath.Join(repoPath, "storage")
		spriteVTTDir := filepath.Join(storageDir, "sprite_vtt")

		arg := args[0]
		var videoPaths []string

		if arg == "all" {
			videoPaths, err = repository.GetAllVideoPaths(repoRoot)
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

		workerCount := runtime.NumCPU() // Number of parallel workers; you can adjust this

		worker := func(jobs <-chan job) {
			defer wg.Done()
			for j := range jobs {
				absPath := j.absPath
				fileName := filepath.Base(absPath)

				fileHash, err := filehash.ComputeFileHash(absPath)
				if err != nil {
					mu.Lock()
					pterm.Warning.Printf("❌ Failed to hash %s: %v\n", fileName, err)
					progressbar.Increment()
					mu.Unlock()
					continue
				}

				videoSpriteDir := filepath.Join(spriteVTTDir, fileHash)
				if err := os.MkdirAll(videoSpriteDir, 0755); err != nil {
					mu.Lock()
					pterm.Warning.Printf("⚠️ Failed to create directory for %s: %v\n", fileName, err)
					progressbar.Increment()
					mu.Unlock()
					continue
				}

				vttPath := filepath.Join(videoSpriteDir, "thumbnails.vtt")
				if _, err := os.Stat(vttPath); err == nil {
					mu.Lock()
					pterm.Warning.Printf("ℹ️ Skipping %s: thumbnails.vtt already exists.\n", fileName)
					progressbar.Increment()
					mu.Unlock()
					continue
				}

				keyframeDir := filepath.Join(videoSpriteDir, "keyframes")
				if err := os.MkdirAll(keyframeDir, 0755); err != nil {
					mu.Lock()
					pterm.Warning.Printf("⚠️ Failed to create keyframe dir for %s: %v\n", fileName, err)
					progressbar.Increment()
					mu.Unlock()
					continue
				}

				if err := thirdparty.ExtractKeyframes(absPath, keyframeDir, 160, 90); err != nil {
					mu.Lock()
					pterm.Warning.Printf("⚠️ Keyframe extraction error for %s: %v\n", fileName, err)
					progressbar.Increment()
					mu.Unlock()
					continue
				}

				spritePattern := filepath.Join(videoSpriteDir, "thumb_L0_%03d.jpg")

				if err := thirdparty.GenerateSpriteSheetsFromFolder(keyframeDir, spritePattern, "5x5", 160, 90); err != nil {
					mu.Lock()
					pterm.Warning.Printf("⚠️ Sprite generation error for %s: %v\n", fileName, err)
					progressbar.Increment()
					mu.Unlock()
					continue
				}

				keyframeTimes, err := thirdparty.GetKeyframePacketTimestamps(absPath)
				if err != nil {
					mu.Lock()
					pterm.Warning.Printf("⚠️ Failed to get keyframe timestamps for %s: %v\n", fileName, err)
					progressbar.Increment()
					mu.Unlock()
					continue
				}
				if len(keyframeTimes) == 0 {
					mu.Lock()
					pterm.Warning.Printf("⚠️ No keyframes found for %s, skipping VTT generation.\n", fileName)
					progressbar.Increment()
					mu.Unlock()
					continue
				}

				vttPattern := filepath.Join("/api/v1/storyboards", fileHash, "thumb_L0_%03d.jpg")
				if err := thirdparty.GenerateVTT(keyframeTimes, "5x5", 160, 90, vttPattern, vttPath, ""); err != nil {
					mu.Lock()
					pterm.Warning.Printf("⚠️ VTT generation error for %s: %v\n", fileName, err)
					progressbar.Increment()
					mu.Unlock()
					continue
				}

				// <-- DELETE KEYFRAME DIRECTORY HERE -->
				if err := os.RemoveAll(keyframeDir); err != nil {
					mu.Lock()
					pterm.Warning.Printf("⚠️ Failed to delete keyframe dir for %s: %v\n", fileName, err)
					mu.Unlock()
				}

				mu.Lock()
				progressbar.Increment()
				mu.Unlock()
			}
		}

		// Start multiple workers
		wg.Add(workerCount)
		for i := 0; i < workerCount; i++ {
			go worker(jobs)
		}

		// Feed the jobs
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

	rootCmd.AddCommand(videoCmd)
}
