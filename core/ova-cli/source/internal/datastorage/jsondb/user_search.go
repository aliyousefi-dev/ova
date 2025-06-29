package jsondb

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
)

// GetUserByUsername finds a user by their username.
// Returns a pointer to a copy of UserData if found, or an error if the user does not exist.
func (s *JsonDB) GetUserByUsername(username string) (*datatypes.UserData, error) {
	s.mu.Lock() // Ensure concurrent reads are safe
	defer s.mu.Unlock()

	users, err := s.loadUsers()
	if err != nil {
		return nil, fmt.Errorf("failed to load users: %w", err)
	}

	user, exists := users[username]
	if !exists {
		return nil, fmt.Errorf("user %q not found", username)
	}
	// Return a pointer to a copy to prevent external modification of the map's stored value
	return &user, nil
}
