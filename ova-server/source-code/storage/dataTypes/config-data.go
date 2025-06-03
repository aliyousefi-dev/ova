package datamodels

import (
	"time"
)

type Config struct {
	Version         string    `json:"version"`
	DefaultUser     string    `json:"defaultUser"`
	DefaultPassword string    `json:"defaultPassword"`
	ServerHost      string    `json:"serverHost"` // backend API host
	ServerPort      int       `json:"serverPort"` // backend API port
	RepositoryPath  string    `json:"repoPath"`
	CreatedAt       time.Time `json:"createdAt"`
}

func GenerateConfigJSON(
	version string,
	serverHost string,
	serverPort int,
	defaultUser string,
	defaultPassword string,
	repoPath string,
) Config {
	return Config{
		Version:         version,
		DefaultUser:     defaultUser,
		DefaultPassword: defaultPassword,
		ServerHost:      serverHost,
		ServerPort:      serverPort,
		RepositoryPath:  repoPath,
		CreatedAt:       time.Now().UTC(),
	}
}

func GenerateEmptyConfigJson() Config {
	return Config{}
}
