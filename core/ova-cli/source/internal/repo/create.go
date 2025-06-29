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
