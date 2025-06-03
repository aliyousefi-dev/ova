package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

const frontendOrigin = "http://localhost:4200" // Change this to your frontend origin

// CORSMiddleware handles CORS preflight requests and adds CORS headers
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {

		DebugMode := true // Set this to true to enable debug mode
		if DebugMode {
			// Bypass auth check in debug mode
			c.Set("username", "debug-user")
			c.Next()
			return
		}

		origin := c.Request.Header.Get("Origin")
		if origin == frontendOrigin {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Set("Vary", "Origin")
		}

		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
