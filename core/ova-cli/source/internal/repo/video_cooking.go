package repo

import (
	"fmt"
	"runtime"
	"sync"
)

func (r *RepoManager) GetTotalVideoCooked() int {

	Videoes, err := r.GetAllIndexedVideos()
	if err != nil {
		return 0
	}

	cooked := 0
	for _, video := range Videoes {
		if r.IsVideoCooked(video.VideoID) {
			cooked++
		}
	}

	return cooked
}

// IsVideoCooked checks if a video is already cooked by its ID.
func (r *RepoManager) IsVideoCooked(VideoID string) bool {

	return r.CheckPreviewThumbnailGenerated(VideoID)
}

// CookVideo cooks a video by its ID.
func (r *RepoManager) CookOneVideo(VideoPath string) error {

	// Ensure the video has a valid ID before cooking
	videoID, err := r.GenerateVideoID(VideoPath)
	if err != nil {
		return fmt.Errorf("failed to generate video ID for %s: %v", VideoPath, err)
	}

	// Check if the video is already Indexed
	if !r.CheckVideoIndexedByID(videoID) {
		return fmt.Errorf("video with ID %s is not indexed", videoID)
	}

	if r.IsVideoCooked(videoID) {
		return fmt.Errorf("video with ID %s is already cooked", videoID)
	}

	// Generate Preview Thumbnails
	error := r.GenerateVideoPreviewThumbnails(VideoPath)
	if error != nil {
		return error
	}

	return nil
}

func (r *RepoManager) CookMultiVideos(VideoPaths []string, progressChan chan int, errorChan chan error) error {
	var wg sync.WaitGroup // WaitGroup to wait for all goroutines to finish
	jobs := make(chan string)
	totalVideos := len(VideoPaths)

	workerCount := runtime.NumCPU()
	processed := make(chan struct{})

	// Worker goroutine function that processes each video
	worker := func() {
		for path := range jobs {
			if err := r.CookOneVideo(path); err != nil {
				if errorChan != nil {
					errorChan <- fmt.Errorf("failed processing %s: %v", path, err)
				}
			}
			processed <- struct{}{}
		}
		wg.Done()
	}

	// Start workers
	for i := 0; i < workerCount; i++ {
		wg.Add(1)
		go worker()
	}

	if progressChan != nil {
		progressChan <- 0
	}

	// Send jobs
	go func() {
		for _, path := range VideoPaths {
			jobs <- path
		}
		close(jobs)
	}()

	// Track progress
	for i := 0; i < totalVideos; i++ {
		<-processed
		if progressChan != nil {
			progress := int((float64(i+1) / float64(totalVideos)) * 100)
			progressChan <- progress
		}
	}

	close(processed)
	wg.Wait()

	// Do not close progressChan or errorChan here; let the caller close them if needed
	return nil
}
