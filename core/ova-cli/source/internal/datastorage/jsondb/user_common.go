package jsondb

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
)

// CreateUser adds a new user if a user with the same username does not already exist.
// Returns an error if a user with the provided username already exists.
func (s *JsonDB) CreateUser(user *datatypes.UserData) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	users, err := s.loadUsers()
	if err != nil {
		return fmt.Errorf("failed to load users: %w", err)
	}

	if _, exists := users[user.Username]; exists {
		return fmt.Errorf("user with username %q already exists", user.Username)
	}

	users[user.Username] = *user // Store a copy of the UserData
	return s.saveUsers(users)
}

// DeleteUser removes a user by their username.
// Returns an error if the user is not found.
func (s *JsonDB) DeleteUser(username string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	users, err := s.loadUsers()
	if err != nil {
		return fmt.Errorf("failed to load users: %w", err)
	}

	if _, exists := users[username]; !exists {
		return fmt.Errorf("user %q not found", username)
	}

	delete(users, username)
	return s.saveUsers(users)
}

func (s *JsonDB) UpdateUser(updatedUser datatypes.UserData) error { // Takes value, not pointer
	s.mu.Lock()
	defer s.mu.Unlock()

	users, err := s.loadUsers()
	if err != nil {
		return fmt.Errorf("failed to load users: %w", err)
	}

	if _, exists := users[updatedUser.Username]; !exists {
		return fmt.Errorf("user %q not found for update", updatedUser.Username)
	}

	users[updatedUser.Username] = updatedUser // Store the updated value
	return s.saveUsers(users)
}

// GetAllUsers returns all users currently in storage as a slice.
func (s *JsonDB) GetAllUsers() ([]datatypes.UserData, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	usersMap, err := s.loadUsers()
	if err != nil {
		return nil, fmt.Errorf("failed to load users: %w", err)
	}

	var users []datatypes.UserData
	for _, user := range usersMap {
		users = append(users, user)
	}
	return users, nil
}
