package server

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"ova-server/source-code/api"
	"ova-server/source-code/storage"

	"github.com/gin-gonic/gin"
)

type BackendServer struct {
	Addr           string
	StorageManager *storage.StorageManager
	SessionManager *api.SessionManager
	router         *gin.Engine
	BaseDir        string
	ServeFrontend  bool
	FrontendPath   string
}

// NewBackendServer creates and configures the unified server.
func NewBackendServer(addr string, storageDir string, basedir string, serveFrontend bool, frontendPath string) *BackendServer {
	manager := storage.NewStorageManager(storageDir)
	sessionManager := api.NewSessionManager()

	return &BackendServer{
		Addr:           addr,
		StorageManager: manager,
		SessionManager: sessionManager,
		router:         gin.Default(),
		BaseDir:        basedir,
		ServeFrontend:  serveFrontend,
		FrontendPath:   frontendPath,
	}
}

func (s *BackendServer) initRoutes() {
	s.router.Use(api.CORSMiddleware())

	v1 := s.router.Group("/api/v1")
	{
		api.RegisterPlaylistsRoutes(v1, s.StorageManager, s.SessionManager)
		api.RegisterUserRoutes(v1, s.StorageManager, s.SessionManager)
		api.RegisterVideoRoutes(v1, s.StorageManager, s.SessionManager, s.BaseDir)
		api.RegisterSearchRoutes(v1, s.StorageManager, s.SessionManager)
		api.RegisterAuthRoutes(v1, s.StorageManager, s.SessionManager)
		api.RegisterVideoTagRoutes(v1, s.StorageManager, s.SessionManager)
		api.RegisterVideoRatingRoutes(v1, s.StorageManager, s.SessionManager)
		api.RegisterStreamRoutes(v1, s.StorageManager, s.SessionManager)
		api.RegisterDownloadRoutes(v1, s.StorageManager, s.SessionManager)
		api.RegisterThumbnailRoutes(v1, s.StorageManager, s.SessionManager)
		api.RegisterPreviewRoutes(v1, s.StorageManager, s.SessionManager)
	}

	if s.ServeFrontend {
		s.serveFrontendStatic()
	}
}

func (s *BackendServer) serveFrontendStatic() {
	fs := http.FileServer(http.Dir(s.FrontendPath))
	s.router.NoRoute(func(c *gin.Context) {
		path := filepath.Join(s.FrontendPath, c.Request.URL.Path)
		if info, err := os.Stat(path); err == nil && !info.IsDir() {
			fs.ServeHTTP(c.Writer, c.Request)
			return
		}
		// Fallback to index.html
		c.File(filepath.Join(s.FrontendPath, "index.html"))
	})
}

// Run starts the unified HTTP server.
func (s *BackendServer) Run() {
	s.initRoutes()
	fmt.Println("Server is running at", s.Addr)
	if err := s.router.Run(s.Addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
