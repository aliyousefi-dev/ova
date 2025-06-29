package server

import (
	"net/http"
	"os"
	"path/filepath"

	"ova-cli/source/internal/api"
	"ova-cli/source/internal/repo"

	"github.com/gin-gonic/gin"
)

type OvaServer struct {
	RepoManager    *repo.RepoManager
	SessionManager *api.SessionManager
	router         *gin.Engine
	BaseDir        string
	ServeFrontend  bool
	FrontendPath   string
	ExeDir         string
	UseHttps       bool
	Addr           string
}

// NewBackendServer creates and configures the unified server.
func NewBackendServer(
	repoManager *repo.RepoManager,
	addr string,
	exeDir string,
	basedir string,
	serveFrontend bool,
	frontendPath string,
	disableAuth bool,
	useHttps bool,
) *OvaServer {
	gin.SetMode(gin.ReleaseMode)

	sessionManager := api.NewSessionManager()
	sessionManager.DisableAuth = disableAuth

	return &OvaServer{
		RepoManager:    repoManager,
		SessionManager: sessionManager,
		router:         gin.Default(),
		BaseDir:        basedir,
		ServeFrontend:  serveFrontend,
		FrontendPath:   frontendPath,
		ExeDir:         exeDir,
		UseHttps:       useHttps,
		Addr:           addr,
	}
}

func (s *OvaServer) initRoutes() {
	s.router.Use(api.CORSMiddleware())

	publicPaths := map[string]bool{
		"/api/v1/auth/login": true,
		"/api/v1/status":     true,
	}
	publicPrefixes := []string{
		"/api/v1/download/",
	}

	v1 := s.router.Group("/api/v1")
	v1.Use(api.AuthMiddleware(s.SessionManager, publicPaths, publicPrefixes))

	api.RegisterAuthRoutes(v1, s.RepoManager, s.SessionManager)
	api.RegisterUserPlaylistRoutes(v1, s.RepoManager)
	api.RegisterUserSavedRoutes(v1, s.RepoManager)
	api.RegisterVideoRoutes(v1, s.RepoManager)
	api.RegisterSearchRoutes(v1, s.RepoManager)
	api.RegisterVideoTagRoutes(v1, s.RepoManager)
	api.RegisterStreamRoutes(v1, s.RepoManager)
	api.RegisterDownloadRoutes(v1, s.RepoManager)
	api.RegisterUploadRoutes(v1, s.RepoManager)
	api.RegisterThumbnailRoutes(v1, s.RepoManager)
	api.RegisterPreviewRoutes(v1, s.RepoManager)
	api.RegisterFolderRoutes(v1, s.RepoManager)
	api.RegisterUserWatchedRoutes(v1, s.RepoManager)
	api.RegisterStoryboardRoutes(v1, s.RepoManager)
	api.RegisterMarkerRoutes(v1, s.RepoManager)
	api.RegisterStatusRoute(v1)

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
		c.File(filepath.Join(s.FrontendPath, "index.html"))
	})
}

// Run starts the unified HTTP or HTTPS server based on UseHttps flag.
func (s *OvaServer) Run() error {
	s.initRoutes()

	if s.UseHttps {
		certFile := filepath.Join(s.ExeDir, "ssl", "cert.pem")
		keyFile := filepath.Join(s.ExeDir, "ssl", "key.pem")
		return s.router.RunTLS(s.Addr, certFile, keyFile)
	}

	return s.router.Run(s.Addr)
}
