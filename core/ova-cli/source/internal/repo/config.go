package repo

import (
	"encoding/json"
	"fmt"
	"os"
	"ova-cli/source/internal/datatypes"
	"time"
)

func GetDefaultConfig() *datatypes.Config {
	return &datatypes.Config{
		Version:              "1.0.0",
		ServerHost:           "0.0.0.0",
		ServerPort:           4040,
		EnableAuthentication: true,
		DataStorageType:      "jsondb",
		CreatedAt:            time.Now(),
	}
}

func (r *RepoManager) LoadRepoConfig() error {
	configPath := r.getRepoConfigFilePath()

	data, err := os.ReadFile(configPath)
	if os.IsNotExist(err) {
		// Use default config and save it
		defaultCfg := GetDefaultConfig()
		r.configs = *defaultCfg
		if err := r.SaveRepoConfig(defaultCfg); err != nil {
			return fmt.Errorf("failed to save default config: %w", err)
		}
		return nil
	} else if err != nil {
		return fmt.Errorf("failed to read config.json: %w", err)
	}

	var cfg datatypes.Config
	if err := json.Unmarshal(data, &cfg); err != nil {
		return fmt.Errorf("failed to parse config.json: %w", err)
	}

	r.configs = cfg
	return nil
}

func (r *RepoManager) SaveRepoConfig(cfg *datatypes.Config) error {
	configPath := r.getRepoConfigFilePath()
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

func (r *RepoManager) GetConfigs() *datatypes.Config {
	return &r.configs
}
