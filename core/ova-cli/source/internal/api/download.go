package api

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"ova-cli/source/internal/interfaces"
	"ova-cli/source/internal/thirdparty"
	"strconv"

	"github.com/gin-gonic/gin"
)

func RegisterDownloadRoutes(rg *gin.RouterGroup, storage interfaces.StorageService) {
	rg.GET("/download/:videoId", downloadVideo(storage))
	rg.GET("/download/:videoId/trim", downloadTrimmedVideo(storage))
}

func downloadVideo(storage interfaces.StorageService) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")

		video, err := storage.GetVideoByID(videoId)
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

		// Set header to force download
		c.Header("Content-Disposition", "attachment; filename=\""+video.Title+".mp4\"")
		c.Header("Content-Type", "application/octet-stream")
		c.File(videoPath)
	}
}

// downloadTrimmedVideo serves a trimmed segment of a video using ffmpeg and streams it directly.
// downloadTrimmedVideo streams a trimmed video segment using ffmpeg, with full debug logs.
func downloadTrimmedVideo(storage interfaces.StorageService) gin.HandlerFunc {
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
			endStr = "" // no end, stream till end
		}

		video, err := storage.GetVideoByID(videoId)
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

		// Build ffmpeg args: input first, then -ss/-to for accurate trimming (re-encode)
		args := []string{
			"-i", videoPath,
		}

		if start > 0 {
			args = append(args, "-ss", fmt.Sprintf("%.2f", start))
		}
		if endStr != "" {
			args = append(args, "-to", fmt.Sprintf("%.2f", end))
		}

		args = append(args,
			"-c:v", "libx264",
			"-c:a", "aac",
			"-preset", "fast",
			"-f", "mp4",
			"pipe:1",
		)

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

		if err := cmd.Start(); err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to start ffmpeg")
			return
		}

		// Log ffmpeg stderr asynchronously for debugging
		go func() {
			errOutput, _ := io.ReadAll(stderr)
			if len(errOutput) > 0 {
				fmt.Println("FFmpeg stderr output:\n", string(errOutput))
			}
		}()

		// Set response headers for download
		c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s_trimmed.mp4\"", video.Title))
		c.Header("Content-Type", "video/mp4")

		// Handle client disconnect: kill ffmpeg process to avoid orphaned processes
		clientGone := c.Request.Context().Done()
		go func() {
			<-clientGone
			if cmd.Process != nil {
				_ = cmd.Process.Kill()
			}
		}()

		// Stream ffmpeg output to response writer
		_, err = io.Copy(c.Writer, stdout)
		if err != nil {
			fmt.Println("Error copying ffmpeg output:", err)
		}

		if err := cmd.Wait(); err != nil {
			fmt.Println("FFmpeg process exited with error:", err)
		}
	}
}
