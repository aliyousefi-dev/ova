package server

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
)

type WebServer struct {
	Addr     string
	BasePath string
}

// NewWebServer initializes the WebServer with the given address and Angular browser path
func NewWebServer(addr string, basePath string) *WebServer {
	return &WebServer{
		Addr:     addr,
		BasePath: basePath,
	}
}

func (ws *WebServer) Run() error {
	// Ensure the base directory exists
	if _, err := os.Stat(ws.BasePath); os.IsNotExist(err) {
		return fmt.Errorf("web server base path does not exist: %s", ws.BasePath)
	}

	// Serve static files and fallback for Angular routes
	fs := http.FileServer(http.Dir(ws.BasePath))
	http.Handle("/", ws.spaHandler(fs))

	// You can remove this print or replace with a logger if you want silent run
	// fmt.Println("Web server running at", ws.Addr)

	err := http.ListenAndServe(ws.Addr, nil)
	if err != nil {
		return fmt.Errorf("failed to start web server: %w", err)
	}
	return nil
}

// spaHandler serves static files and falls back to index.html for client-side routing
func (ws *WebServer) spaHandler(fs http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Construct full path to the requested file
		fullPath := filepath.Join(ws.BasePath, r.URL.Path)

		// Check if the file exists and is not a directory
		info, err := os.Stat(fullPath)
		if err == nil && !info.IsDir() {
			fs.ServeHTTP(w, r)
			return
		}

		// Otherwise, serve index.html for Angular routing
		http.ServeFile(w, r, filepath.Join(ws.BasePath, "index.html"))
	}
}
