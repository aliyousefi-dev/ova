package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// CORSMiddleware allows all origins and supports credentials (for development only)
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {

		DebugMode := false // Enable if you want to bypass auth in dev
		if DebugMode {
			c.Set("username", "debug-user")
			c.Next()
			return
		}

		origin := c.Request.Header.Get("Origin")
		if origin != "" {
			// Allow all origins dynamically (but not '*', because we're using credentials)
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Set("Vary", "Origin") // Important for caching proxies
		}

		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

		// Handle preflight OPTIONS request
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
