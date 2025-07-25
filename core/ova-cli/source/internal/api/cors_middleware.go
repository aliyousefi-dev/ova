package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		debug := true // Set to false in production for better security

		origin := c.Request.Header.Get("Origin")
		if origin == "" {
			origin = "http://localhost:4200" // Default to localhost if no origin is specified
		}

		// Debug mode: allow any origin
		if debug {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Set("Vary", "Origin")
		} else {
			// Production mode: specify your frontend URL here
			c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:4200")
		}

		// Allow credentials and headers
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-Session-Id, ova-auth")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

		// Handle OPTIONS preflight requests
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

