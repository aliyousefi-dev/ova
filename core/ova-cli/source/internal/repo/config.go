package repo

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"ova-cli/source/internal/datatypes"
	"time"
)

func (r *RepoManager) GetDefaultConfig() *datatypes.Config {
	config, err := r.GetDefaultConfigTemplate()
	if err != nil {
		// Log the error or handle it internally (you can customize this part)
		log.Printf("Error getting default config: %v", err)
		// Return a fallback config in case of error
		return &datatypes.Config{
			Version:              "1.0.0",
			ServerHost:           "0.0.0.0",
			ServerPort:           4040,
			EnableAuthentication: true,
			DataStorageType:      "jsondb",
			CreatedAt:            time.Now(),
		}
	}
	return config
}

func (r *RepoManager) GetDefaultConfigTemplate() (*datatypes.Config, error) {
	templatepath := r.GetDefaultConfigTemplateFilePath()

	// Check if the file exists
	if _, err := os.Stat(templatepath); os.IsNotExist(err) {
		// File doesn't exist, create it with the default config
		defaultConfig := &datatypes.Config{
			Version:              "1.0.0",
			ServerHost:           "0.0.0.0",
			ServerPort:           4040,
			EnableAuthentication: true,
			DataStorageType:      "jsondb",
			CreatedAt:            time.Now(),
		}

		// Create and write to the file
		file, err := os.Create(templatepath)
		if err != nil {
			return nil, fmt.Errorf("could not create config file: %v", err)
		}
		defer file.Close()

		// Marshal and write the config data to the file (assuming the Config struct is JSON serializable)
		encoder := json.NewEncoder(file)
		encoder.SetIndent("", "  ")
		if err := encoder.Encode(defaultConfig); err != nil {
			return nil, fmt.Errorf("could not write config to file: %v", err)
		}

		return defaultConfig, nil
	}

	// If the file exists, read and return the existing config
	file, err := os.Open(templatepath)
	if err != nil {
		return nil, fmt.Errorf("could not open config file: %v", err)
	}
	defer file.Close()

	var config datatypes.Config
	decoder := json.NewDecoder(file)
	if err := decoder.Decode(&config); err != nil {
		return nil, fmt.Errorf("could not read config from file: %v", err)
	}

	return &config, nil
}

func (r *RepoManager) LoadRepoConfig() error {
	configPath := r.getRepoConfigFilePath()

	data, err := os.ReadFile(configPath)
	if os.IsNotExist(err) {
		// Use default config and save it
		defaultCfg := r.GetDefaultConfig()
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

func (r *RepoManager) CreateDefaultConfigFileWithStorageType(rootuser string, storageType string) error {
	defaultCfg := r.GetDefaultConfig()
	defaultCfg.DataStorageType = storageType
	defaultCfg.RootUser = rootuser
	r.configs = *defaultCfg

	if err := r.SaveRepoConfig(defaultCfg); err != nil {
		return fmt.Errorf("failed to create new config: %w", err)
	}
	return nil
}
