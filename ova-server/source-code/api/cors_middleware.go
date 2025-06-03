package api

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

// CORSMiddleware allows all origins dynamically and supports credentials
// If debug is false, middleware does nothing (passes through).
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {

		debug := false
		if !debug {
			// Debug disabled: skip CORS processing
			c.Next()
			return
		}

		origin := c.Request.Header.Get("Origin")

		if origin != "" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Set("Vary", "Origin")
		}

		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

		// Optional: log request for debugging
		fmt.Printf("CORS: %s %s Origin: %s\n", c.Request.Method, c.Request.URL.Path, origin)

		// Handle preflight
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
