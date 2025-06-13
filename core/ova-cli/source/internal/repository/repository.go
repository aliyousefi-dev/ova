package repository

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"golang.org/x/crypto/bcrypt"

	"ova-cli/source/internal/datatypes"
	"ova-cli/source/internal/interfaces"
)

type Repository struct {
	RepoPath   string
	ConfigFile string
	Storage    interfaces.StorageService
}

func NewRepository(repoPath string, storage interfaces.StorageService) *Repository {
	return &Repository{
		RepoPath:   repoPath,
		ConfigFile: filepath.Join(repoPath, "config.json"),
		Storage:    storage,
	}
}

func (r *Repository) Init() error {
	return r.InitWithUser("user", "pass")
}

func (r *Repository) InitWithUser(username, password string) error {
	// Ensure repo path exists
	if err := os.MkdirAll(r.RepoPath, 0755); err != nil {
		return fmt.Errorf("failed to create repo directory: %w", err)
	}

	// Prepare the storage (create folders, files)
	if err := r.Storage.PrepareStorage(); err != nil {
		return fmt.Errorf("failed to prepare storage: %w", err)
	}

	// Create default config
	config := datatypes.GenerateEmptyConfigJson()
	config.ServerHost = "127.0.0.1"
	config.ServerPort = 4040
	config.Version = "1.0.0"

	configContent, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to serialize config: %w", err)
	}

	if _, err := os.Stat(r.ConfigFile); os.IsNotExist(err) {
		if err := os.WriteFile(r.ConfigFile, configContent, 0644); err != nil {
			return fmt.Errorf("failed to write config file: %w", err)
		}
	}

	// Hash password and create user
	hashedPass, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	user := datatypes.UserData{
		Username:     username,
		PasswordHash: string(hashedPass),
		Roles:        []string{"admin"},
		CreatedAt:    time.Now().UTC(),
	}

	if err := r.Storage.CreateUser(&user); err != nil && err.Error() != "user with this ID already exists" {
		return fmt.Errorf("failed to create default user: %w", err)
	}

	return nil
}
