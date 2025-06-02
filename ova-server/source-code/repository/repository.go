package repository

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"ova-server/source-code/storage/datamodels"

	"golang.org/x/crypto/bcrypt"
)

type Repository struct {
	RepositoryPath string
	OvaRepoPath    string
	StoragePath    string
	ThumbnailPath  string
	ConfigFile     string
	PlaylistsDB    string
	VideosDB       string
	UsersDB        string
}

// NewRepository prepares paths based on a base directory
func NewRepository(base string) *Repository {
	absBase, _ := filepath.Abs(base)
	repo := filepath.Join(absBase, ".ova-repo")
	storage := filepath.Join(repo, "storage")
	thumbs := filepath.Join(repo, "thumbnails")

	return &Repository{
		RepositoryPath: absBase,
		OvaRepoPath:    repo,
		StoragePath:    storage,
		ThumbnailPath:  thumbs,
		ConfigFile:     filepath.Join(repo, "config.json"),
		PlaylistsDB:    filepath.Join(storage, "playlists.json"),
		VideosDB:       filepath.Join(storage, "videos.json"),
		UsersDB:        filepath.Join(storage, "users.json"),
	}
}

// Init creates the directory structure and default config and user
func (r *Repository) Init() error {
	// Create required directories
	if err := os.MkdirAll(r.StoragePath, os.ModePerm); err != nil {
		return fmt.Errorf("failed to create storage folder: %w", err)
	}
	if err := os.MkdirAll(r.ThumbnailPath, os.ModePerm); err != nil {
		return fmt.Errorf("failed to create thumbnails folder: %w", err)
	}

	// Config
	config := datamodels.GenerateEmptyConfigJson()
	config.ServerHost = "127.0.0.1"
	config.ServerPort = 8080
	config.FrontendHost = "127.0.0.1"
	config.FrontendPort = 8081
	config.DefaultUser = "user"
	config.DefaultPassword = "pass"
	config.RepositoryPath = r.RepositoryPath
	config.Version = "1.0.0"

	configContent, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to serialize config: %w", err)
	}

	// Default user
	hashedPass, err := bcrypt.GenerateFromPassword([]byte(config.DefaultPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	user := datamodels.UserData{
		Username:     config.DefaultUser,
		PasswordHash: string(hashedPass),
		Roles:        []string{"admin"},
		CreatedAt:    time.Now().UTC(),
		Favorites:    []string{},
	}

	usersMap := map[string]datamodels.UserData{
		user.Username: user,
	}

	usersContent, err := json.MarshalIndent(usersMap, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to serialize users data: %w", err)
	}

	// Files to write
	filesToCreate := map[string][]byte{
		r.ConfigFile:  configContent,
		r.PlaylistsDB: []byte("{}"),
		r.VideosDB:    []byte("{}"),
		r.UsersDB:     usersContent,
	}

	for path, content := range filesToCreate {
		if _, err := os.Stat(path); os.IsNotExist(err) {
			if err := os.WriteFile(path, content, 0644); err != nil {
				return fmt.Errorf("failed to create file %s: %w", path, err)
			}
		}
	}

	return nil
}
