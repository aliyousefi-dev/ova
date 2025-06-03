package datatypes

import (
	"time"
)

type UserData struct {
	Username     string    `json:"username"`
	PasswordHash string    `json:"passwordHash"`
	Roles        []string  `json:"roles"`
	CreatedAt    time.Time `json:"createdAt"`
	LastLoginAt  time.Time `json:"lastLoginAt,omitempty"`
	Favorites    []string  `json:"favorites"`
}

func GenerateUserJSON(username string, passwordHashed string) UserData {
	return UserData{
		Username:     username,
		PasswordHash: passwordHashed,
		Roles:        []string{"admin", "user"},
		CreatedAt:    time.Now().UTC(),
		LastLoginAt:  time.Time{},
		Favorites:    []string{},
	}
}
