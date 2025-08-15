package server

import (
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"sync"
)

func StartDocServer() {
	// Get the executable's path
	exePath, err := os.Executable()
	if err != nil {
		log.Fatalf("Error getting executable path: %v", err)
		return
	}

	// Get the directory of the executable
	exeDir := filepath.Dir(exePath)

	// Define the path for the documentation folder, relative to the executable
	docDir := filepath.Join(exeDir, "docs")

	// Set the directory for static files (e.g., HTML, CSS, JS)
	fs := http.FileServer(http.Dir(docDir))

	// Serve the static files at root (/) and use fs to serve them
	http.Handle("/", http.StripPrefix("/", fs))

	// Optionally, log the directory path being served
	absPath, err := filepath.Abs(docDir)
	if err != nil {
		log.Fatalf("Error getting absolute path: %v", err)
	}
	log.Printf("Serving documentation from: %s", absPath)

	// Start the HTTP server on port 8080 in a goroutine so we can open the browser
	var wg sync.WaitGroup
	wg.Add(1)

	go func() {
		defer wg.Done() // Mark this goroutine as done once the server finishes
		log.Println("Starting server on http://localhost:8080")
		if err := http.ListenAndServe(":8080", nil); err != nil {
			log.Fatalf("Error starting server: %v", err)
		}
	}()

	// Open the browser automatically
	err = openBrowser("http://localhost:8080")
	if err != nil {
		log.Fatalf("Failed to open the browser: %v", err)
	}

	// Block the main goroutine until the server is stopped (keeps the program alive)
	wg.Wait()
}

// openBrowser tries to open the default browser with the given URL
func openBrowser(url string) error {
	var err error
	switch {
	case isLinux(): // Linux
		err = exec.Command("xdg-open", url).Start()
	case isMacOS(): // macOS
		err = exec.Command("open", url).Start()
	case isWindows(): // Windows
		err = exec.Command("cmd", "/C", "start", url).Start() // Use cmd to invoke start command
	default:
		err = exec.Command(url).Start() // Try default
	}
	return err
}

func isWindows() bool {
	return filepath.Separator == '\\'
}

func isLinux() bool {
	return filepath.Separator == '/'
}

func isMacOS() bool {
	// You can enhance this with runtime.GOOS if needed
	return filepath.Separator == '/'
}
