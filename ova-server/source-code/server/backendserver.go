package server

import (
	"fmt"
	"log"
	"net/http"
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
}

// NewBackendServer creates and configures the server.
func NewBackendServer(addr string, storageDir string, basedir string) *BackendServer {
	manager := storage.NewStorageManager(storageDir)
	sessionManager := api.NewSessionManager()

	return &BackendServer{
		Addr:           addr,
		StorageManager: manager,
		router:         gin.Default(),
		SessionManager: sessionManager,
		BaseDir:        basedir,
	}
}

func (s *BackendServer) initRoutes() {

	// bypass the cors security
	s.router.Use(api.CORSMiddleware())

	v1 := s.router.Group("/api/v1")
	{
		api.RegisterPlaylistsRoutes(v1, s.StorageManager, s.SessionManager)
		api.RegisterUserRoutes(v1, s.StorageManager, s.SessionManager)
		// Pass s.StorageManager.StorageDir (or storageDir) as baseDir here
		api.RegisterVideoRoutes(v1, s.StorageManager, s.SessionManager, s.BaseDir)
		api.RegisterSearchRoutes(v1, s.StorageManager, s.SessionManager)
		api.RegisterAuthRoutes(v1, s.StorageManager, s.SessionManager)
		api.RegisterVideoTagRoutes(v1, s.StorageManager, s.SessionManager)
		api.RegisterVideoRatingRoutes(v1, s.StorageManager, s.SessionManager)

		api.RegisterStreamRoutes(v1, s.StorageManager, s.SessionManager)
		api.RegisterThumbnailRoutes(v1, s.StorageManager, s.SessionManager)
		api.RegisterPreviewRoutes(v1, s.StorageManager, s.SessionManager)
	}

}

// Run starts the HTTP server.
func (s *BackendServer) Run() {
	s.initRoutes()

	fmt.Println("Server is running at", s.Addr)
	if err := http.ListenAndServe(s.Addr, s.router); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
