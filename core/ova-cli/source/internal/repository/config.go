package repository

import (
	"encoding/json"
	"fmt"
	"os"
	"ova-cli/source/internal/datatypes"
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

// SaveRepoConfig saves the config to .ova-repo/config.json.
func SaveRepoConfig(basePath string, cfg *datatypes.Config) error {
	configDir := filepath.Join(basePath, ".ova-repo")
	configPath := filepath.Join(configDir, "config.json")

	// Ensure the directory exists
	if err := os.MkdirAll(configDir, 0755); err != nil {
		return fmt.Errorf("failed to create config directory: %w", err)
	}

	file, err := os.Create(configPath)
	if err != nil {
		return fmt.Errorf("failed to create config.json: %w", err)
	}
	defer file.Close()

	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "  ") // Pretty print
	if err := encoder.Encode(cfg); err != nil {
		return fmt.Errorf("failed to write config.json: %w", err)
	}

	return nil
}
