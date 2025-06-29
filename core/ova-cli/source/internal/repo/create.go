package repo

import (
	"fmt"
	"os"
)

func (r *RepoManager) CreateDefaultConfigFile() error {
	defaultCfg := GetDefaultConfig()
	r.configs = *defaultCfg

	if err := r.SaveRepoConfig(defaultCfg); err != nil {
		return fmt.Errorf("failed to create new config: %w", err)
	}
	return nil
}

// CreateRepoFolder ensures the .ova-repo directory exists
func (r *RepoManager) CreateRepoFolder() error {
	repoPath := r.GetRepoDir()

	if err := os.MkdirAll(repoPath, 0755); err != nil {
		return fmt.Errorf("failed to create .ova-repo directory: %w", err)
	}

	return nil
}

func (r *RepoManager) CreateRepoWithUser(username, password string) error {
	// Check if repo exists (no error means exists)
	err := r.IsRepoExists()
	if err != nil {
		// Repo doesn't exist, create folder and config
		if err := r.CreateRepoFolder(); err != nil {
			return err
		}
		if err := r.CreateDefaultConfigFile(); err != nil {
			return err
		}
	}

	// Create admin user
	if err := r.CreateUser(username, password, true); err != nil {
		return err
	}

	return nil
}
