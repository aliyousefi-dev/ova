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

type OvaServer struct {
	Addr           string
	StorageManager *storage.StorageManager
	SessionManager *api.SessionManager
	router         *gin.Engine
	BaseDir        string
	ServeFrontend  bool
	FrontendPath   string
	// DisableAuth removed here since it's in SessionManager now
}

// NewBackendServer creates and configures the unified server.
func NewBackendServer(addr string, storageDir string, basedir string, serveFrontend bool, frontendPath string, disableAuth bool) *OvaServer {
	manager := storage.NewStorageManager(storageDir)
	sessionManager := api.NewSessionManager()
	sessionManager.DisableAuth = disableAuth // set flag here

	return &OvaServer{
		Addr:           addr,
		StorageManager: manager,
		SessionManager: sessionManager,
		router:         gin.Default(),
		BaseDir:        basedir,
		ServeFrontend:  serveFrontend,
		FrontendPath:   frontendPath,
	}
}

func (s *OvaServer) initRoutes() {
	s.router.Use(api.CORSMiddleware())

	publicPaths := map[string]bool{
		"/api/v1/auth/login": true,
	}
	publicPrefixes := []string{
		"/api/v1/download/",
	}

	v1 := s.router.Group("/api/v1")
	v1.Use(api.AuthMiddleware(s.SessionManager, publicPaths, publicPrefixes))

	{
		api.RegisterAuthRoutes(v1, s.StorageManager, s.SessionManager)
		api.RegisterUserPlaylistRoutes(v1, s.StorageManager)
		api.RegisterUserFavoritesRoutes(v1, s.StorageManager)
		api.RegisterVideoRoutes(v1, s.StorageManager)
		api.RegisterSearchRoutes(v1, s.StorageManager)
		api.RegisterVideoTagRoutes(v1, s.StorageManager)
		api.RegisterVideoRatingRoutes(v1, s.StorageManager)
		api.RegisterStreamRoutes(v1, s.StorageManager)
		api.RegisterDownloadRoutes(v1, s.StorageManager)
		api.RegisterThumbnailRoutes(v1, s.StorageManager)
		api.RegisterPreviewRoutes(v1, s.StorageManager)
	}

	if s.ServeFrontend {
		s.serveFrontendStatic()
	}
}

func (s *OvaServer) serveFrontendStatic() {
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
func (s *OvaServer) Run() {
	s.initRoutes()
	fmt.Println("Server is running at", s.Addr)
	if err := s.router.Run(s.Addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
