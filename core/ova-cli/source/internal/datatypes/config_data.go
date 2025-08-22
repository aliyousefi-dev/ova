package datatypes

import (
	"time"
)

type Config struct {
	Version              string    `json:"version"`
	ServerHost           string    `json:"serverHost"`
	ServerPort           int       `json:"serverPort"`
	RootUser             string    `json:"rootUser"`
	EnableAuthentication bool      `json:"enableAuthentication"`
	DataStorageType      string    `json:"dataStorageType"` // "jsondb", "boltdb", etc.
	CreatedAt            time.Time `json:"createdAt"`
}
