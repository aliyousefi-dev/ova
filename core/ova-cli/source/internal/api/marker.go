package api

import (
	"net/http"
	"os"
	"strconv"
	"strings"

	"ova-cli/source/internal/datatypes"
	"ova-cli/source/internal/repo"

	"github.com/gin-gonic/gin"
)

// RegisterMarkerRoutes sets up the API endpoints for marker management using RepoManager.
func RegisterMarkerRoutes(rg *gin.RouterGroup, rm *repo.RepoManager) {
	rg.POST("/video/markers/:videoId", updateMarkers(rm))
	rg.GET("/video/markers/:videoId", getMarkers(rm))
	rg.GET("/video/markers/:videoId/file", getMarkerFile(rm))
	rg.DELETE("/video/markers/:videoId", deleteAllMarkers(rm))
	rg.DELETE("/video/markers/:videoId/:hour/:minute/:second", deleteMarker(rm))
}

func updateMarkers(rm *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")
		if videoId == "" {
			respondError(c, http.StatusBadRequest, "videoId parameter is required")
			return
		}

		var req datatypes.UpdateMarkersRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			respondError(c, http.StatusBadRequest, "Invalid JSON payload: "+err.Error())
			return
		}

		var markersToSave []datatypes.VideoMarker
		for _, vm := range req.Markers {
			if vm.Hour < 0 || vm.Minute < 0 || vm.Second < 0 {
				respondError(c, http.StatusBadRequest, "Marker time values cannot be negative")
				return
			}
			if vm.Minute >= 60 || vm.Second >= 60 {
				respondError(c, http.StatusBadRequest, "Minute and second must be less than 60")
				return
			}
			if strings.TrimSpace(vm.Title) == "" {
				respondError(c, http.StatusBadRequest, "Marker title cannot be empty")
				return
			}
			markersToSave = append(markersToSave, vm)
		}

		if err := rm.DeleteAllMarkersFromVideo(videoId); err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to clear existing markers: "+err.Error())
			return
		}
		for _, marker := range markersToSave {
			if err := rm.AddMarkerToVideo(videoId, marker); err != nil {
				respondError(c, http.StatusInternalServerError, "Failed to add marker: "+err.Error())
				return
			}
		}

		markersForResponse, err := rm.GetMarkersForVideo(videoId)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to retrieve updated markers: "+err.Error())
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{
			"videoId": videoId,
			"markers": markersForResponse,
		}, "Markers updated successfully")
	}
}

func getMarkers(rm *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")
		if videoId == "" {
			respondError(c, http.StatusBadRequest, "videoId parameter is required")
			return
		}

		markersForResponse, err := rm.GetMarkersForVideo(videoId)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to get markers: "+err.Error())
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{
			"videoId": videoId,
			"markers": markersForResponse,
		}, "Markers fetched successfully")
	}
}

func getMarkerFile(rm *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")
		if videoId == "" {
			respondError(c, http.StatusBadRequest, "videoId parameter is required")
			return
		}

		// Use GetVideoMarkerFilePathByVideoID to get the correct file path for the VTT marker file
		filePath := rm.GetVideoMarkerFilePathByVideoID(videoId)

		if _, err := os.Stat(filePath); err != nil {
			if os.IsNotExist(err) {
				respondError(c, http.StatusNotFound, "VTT marker file not found for videoId: "+videoId)
				return
			}
			respondError(c, http.StatusInternalServerError, "Failed to access VTT marker file: "+err.Error())
			return
		}

		c.Header("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
		c.Header("Pragma", "no-cache")
		c.Header("Expires", "0")
		c.Header("Surrogate-Control", "no-store")
		c.Header("Content-Type", "text/vtt")

		c.File(filePath)
	}
}

func deleteAllMarkers(rm *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")
		if videoId == "" {
			respondError(c, http.StatusBadRequest, "videoId parameter is required")
			return
		}

		if err := rm.DeleteAllMarkersFromVideo(videoId); err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to delete all markers: "+err.Error())
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{
			"videoId": videoId,
		}, "All markers deleted successfully")
	}
}

func deleteMarker(rm *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")
		hourStr := c.Param("hour")
		minuteStr := c.Param("minute")
		secondStr := c.Param("second")

		if videoId == "" || hourStr == "" || minuteStr == "" || secondStr == "" {
			respondError(c, http.StatusBadRequest, "videoId, hour, minute, and second parameters are required")
			return
		}

		hour, err := strconv.Atoi(hourStr)
		if err != nil {
			respondError(c, http.StatusBadRequest, "Invalid hour parameter: "+err.Error())
			return
		}
		minute, err := strconv.Atoi(minuteStr)
		if err != nil {
			respondError(c, http.StatusBadRequest, "Invalid minute parameter: "+err.Error())
			return
		}
		second, err := strconv.Atoi(secondStr)
		if err != nil {
			respondError(c, http.StatusBadRequest, "Invalid second parameter: "+err.Error())
			return
		}

		markerToDelete := datatypes.VideoMarker{
			Hour:   hour,
			Minute: minute,
			Second: second,
		}

		if err := rm.DeleteMarkerFromVideo(videoId, markerToDelete); err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to delete marker: "+err.Error())
			return
		}

		respondSuccess(c, http.StatusOK, gin.H{
			"videoId": videoId,
			"hour":    hour,
			"minute":  minute,
			"second":  second,
		}, "Marker deleted successfully")
	}
}
