package repository

import (
	"encoding/json"
	"os"
	"path/filepath"
)

func WriteRuntimeConfig(backendUrl string, basePath string) error {
	config := map[string]string{
		"APIUrl": "http://" + backendUrl + "/api/v1", // concatenate correctly
	}

	configPath := filepath.Join(basePath, "frontend", "browser", "config", "production.json")

	file, err := os.Create(configPath)
	if err != nil {
		return err
	}
	defer file.Close()

	return json.NewEncoder(file).Encode(config)
}
