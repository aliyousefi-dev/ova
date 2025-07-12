package api

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		debug := false // Set to false in production for better security

		// Handle CORS headers for different environments
		if debug {
			// Reflect the Origin header (which is sent by the browser)
			origin := c.Request.Header.Get("Origin")
			fmt.Printf("[CORS Debug] Raw Request Origin Header Received: '%s'\n", origin)

			if origin != "" {
				// Allow the specific origin for requests with credentials
				c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
				c.Writer.Header().Set("Vary", "Origin")
				fmt.Printf("[CORS Debug] Setting Access-Control-Allow-Origin to reflected Origin: '%s'\n", origin)
			} else {
				// Allow all origins in debug mode for ease (should be replaced in production)
				c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
				c.Writer.Header().Set("Vary", "Origin")
				fmt.Printf("[CORS Debug] Setting Access-Control-Allow-Origin to '*' for open access.\n")
			}

			// Allow credentials, headers, and methods
			c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
			c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-Session-Id")
			c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		} else {
			// Production mode: restrict CORS to your specific frontend URL
			c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:4200") // Use your frontend's actual URL in production
			c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
			c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-Session-Id")
			c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		}

		// Handle OPTIONS preflight requests (CORS)
		if c.Request.Method == http.MethodOptions {
			fmt.Println("[CORS Debug] Handling OPTIONS preflight request. Aborting with 204.")
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		// Continue processing the request
		c.Next()
	}
}
