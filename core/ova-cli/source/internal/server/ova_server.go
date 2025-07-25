package server

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/grandcat/zeroconf"

	"ova-cli/source/internal/api"
	"ova-cli/source/internal/repo"
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

func (s *OvaServer) Run() error {
	s.initRoutes()

	// Start mDNS service advertisement
	go func() {
		port := parsePort(s.Addr)

		server, err := zeroconf.Register(
			"ova-server",        // Instance name (visible to network)
			"_http._tcp",        // Service type
			"local.",            // Domain
			port,                // Port from your Addr
			[]string{"version=1", "app=ova"}, // TXT records
			nil,                 // Use default interface
		)
		if err != nil {
			log.Printf("mDNS registration failed: %v", err)
			return
		}
		log.Println("✅ mDNS service announced as ova-server._http._tcp.local")

		defer server.Shutdown()
		select {} // Keep mDNS running
	}()

	if s.UseHttps {
		// Get the SSL folder path using GetSSLPath()
		sslFolderPath := s.RepoManager.GetSSLPath()

		// Set the cert and key file paths
		certFile := filepath.Join(sslFolderPath, "cert.pem")
		keyFile := filepath.Join(sslFolderPath, "cert-key.pem")

		return s.router.RunTLS(s.Addr, certFile, keyFile)
	}
	return s.router.Run(s.Addr)
}

// Helper to extract port from address string like ":8080" or "0.0.0.0:8080"
func parsePort(addr string) int {
	parts := strings.Split(addr, ":")
	portStr := parts[len(parts)-1]
	port, err := strconv.Atoi(portStr)
	if err != nil {
		log.Fatalf("Invalid port in address: %v", addr)
	}
	return port
}
