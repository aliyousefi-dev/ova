package datatypes

import (
	"time"
)

type ConfigData struct {
	Version              string    `json:"version"`
	ServerHost           string    `json:"serverHost"`
	ServerPort           int       `json:"serverPort"`
	RootUser             string    `json:"rootUser"`
	EnableAuthentication bool      `json:"enableAuthentication"`
	MaxBucketSize        int       `json:"maxBucketSize"`
	EnableDocs           bool      `json:"enableDocs"`
	DataStorageType      string    `json:"dataStorageType"`
	CreatedAt            time.Time `json:"createdAt"`
}
