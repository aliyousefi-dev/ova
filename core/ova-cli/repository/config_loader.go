package repository

import (
	"encoding/json"
	"fmt"
	"os"
	"ova-cli/storage/datatypes"
	"path/filepath"
)

// LoadRepoConfig loads the config.json from the repo.
func LoadRepoConfig(basePath string) (*datatypes.Config, error) {
	configPath := filepath.Join(basePath, ".ova-repo", "config.json")
	data, err := os.ReadFile(configPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read config.json: %w", err)
	}

	var cfg datatypes.Config
	if err := json.Unmarshal(data, &cfg); err != nil {
		return nil, fmt.Errorf("failed to parse config.json: %w", err)
	}
	return &cfg, nil
}
