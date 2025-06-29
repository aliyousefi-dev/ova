package datatypes

import (
	"time"
)

type Config struct {
	Version              string    `json:"version"`
	ServerHost           string    `json:"serverHost"`           // backend API host
	ServerPort           int       `json:"serverPort"`           // backend API port
	EnableAuthentication bool      `json:"enableAuthentication"` // new field for auth toggle
	CreatedAt            time.Time `json:"createdAt"`
}
