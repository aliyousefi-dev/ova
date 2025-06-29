package api

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"strconv"

	"ova-cli/source/internal/repo"
	"ova-cli/source/internal/thirdparty"

	"github.com/gin-gonic/gin"
)

// RegisterDownloadRoutes registers download endpoints using RepoManager
func RegisterDownloadRoutes(rg *gin.RouterGroup, rm *repo.RepoManager) {
	rg.GET("/download/:videoId", downloadVideo(rm))
	rg.GET("/download/:videoId/trim", downloadTrimmedVideo(rm))
}

func downloadVideo(rm *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")

		video, err := rm.GetVideoByID(videoId)
		if err != nil {
			respondError(c, http.StatusNotFound, "Video not found")
			return
		}

		videoPath := video.FilePath
		info, err := os.Stat(videoPath)
		if os.IsNotExist(err) {
			respondError(c, http.StatusNotFound, "Video file not found on disk")
			return
		} else if err != nil {
			respondError(c, http.StatusInternalServerError, "Error accessing video file")
			return
		}

		// Set headers for download
		c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s.mp4\"", video.Title))
		c.Header("Content-Type", "application/octet-stream")
		c.Header("Content-Length", fmt.Sprintf("%d", info.Size()))

		// Serve file using Gin helper
		c.File(videoPath)
	}
}

func downloadTrimmedVideo(rm *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")

		startStr := c.Query("start")
		endStr := c.Query("end")

		start, err := strconv.ParseFloat(startStr, 64)
		if err != nil || start < 0 {
			start = 0
		}

		end, err := strconv.ParseFloat(endStr, 64)
		if err != nil || end <= start {
			respondError(c, http.StatusBadRequest, "Invalid end time")
			return
		}

		duration := end - start
		if duration <= 0 {
			respondError(c, http.StatusBadRequest, "Trim duration must be positive")
			return
		}

		video, err := rm.GetVideoByID(videoId)
		if err != nil {
			respondError(c, http.StatusNotFound, "Video not found")
			return
		}

		videoPath := video.FilePath
		if _, err := os.Stat(videoPath); os.IsNotExist(err) {
			respondError(c, http.StatusNotFound, "Video file not found on disk")
			return
		} else if err != nil {
			respondError(c, http.StatusInternalServerError, "Error accessing video file")
			return
		}

		ffmpegPath, err := thirdparty.GetFFmpegPath()
		if err != nil {
			respondError(c, http.StatusInternalServerError, "FFmpeg not found")
			return
		}

		args := []string{
			"-ss", fmt.Sprintf("%.2f", start),
			"-i", videoPath,
			"-t", fmt.Sprintf("%.2f", duration),
			"-c:v", "libx264",
			"-c:a", "aac",
			"-preset", "fast",
			"-movflags", "frag_keyframe+empty_moov",
			"-f", "mp4",
			"pipe:1",
		}

		fmt.Println("Running FFmpeg:", ffmpegPath, args)

		cmd := exec.Command(ffmpegPath, args...)

		stdout, err := cmd.StdoutPipe()
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to create output pipe")
			return
		}

		stderr, err := cmd.StderrPipe()
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to create stderr pipe")
			return
		}

		c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s_trimmed.mp4\"", video.Title))
		c.Header("Content-Type", "video/mp4")

		if err := cmd.Start(); err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to start ffmpeg")
			return
		}

		go func() {
			errOutput, _ := io.ReadAll(stderr)
			if len(errOutput) > 0 {
				fmt.Println("FFmpeg stderr:\n", string(errOutput))
			}
		}()

		clientGone := c.Request.Context().Done()
		go func() {
			<-clientGone
			fmt.Println("Client disconnected, killing ffmpeg")
			if cmd.Process != nil {
				_ = cmd.Process.Kill()
			}
		}()

		flusher, ok := c.Writer.(http.Flusher)
		if !ok {
			fmt.Println("ResponseWriter does not implement http.Flusher")
		}

		buf := make([]byte, 32*1024)
		for {
			n, err := stdout.Read(buf)
			if n > 0 {
				if _, wErr := c.Writer.Write(buf[:n]); wErr != nil {
					fmt.Println("Error writing to client:", wErr)
					break
				}
				if ok {
					flusher.Flush()
				}
			}
			if err != nil {
				if err != io.EOF {
					fmt.Println("Error reading ffmpeg output:", err)
				}
				break
			}
		}

		waitErr := cmd.Wait()
		if waitErr != nil {
			fmt.Println("FFmpeg exited with error:", waitErr)
		} else {
			fmt.Println("FFmpeg finished successfully.")
		}
	}
}
