package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// RegisterStatusRoute sets up a basic status route to verify server availability.
func RegisterStatusRoute(rg *gin.RouterGroup) {
	rg.GET("/status", func(c *gin.Context) {
		respondSuccess(c, http.StatusOK, gin.H{
			"status": "ok",
		}, "Server is running")
	})
}
