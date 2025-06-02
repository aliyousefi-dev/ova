package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// CORSMiddleware handles CORS preflight requests and adds CORS headers
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Set the CORS headers
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*") // Allow all origins, change to specific origin in production
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

		// Handle OPTIONS method (CORS preflight requests)
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent) // 204 No Content
			return
		}

		// Continue to next middleware/handler
		c.Next()
	}
}
