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

// DeleteUser removes a user by their username and returns the deleted user data.
// Returns an error if the user is not found or if there is a problem loading or saving users.
func (s *JsonDB) DeleteUser(username string) (*datatypes.UserData, error) {
    s.mu.Lock()
    defer s.mu.Unlock()

    // Load all users from the data source
    users, err := s.loadUsers()
    if err != nil {
        return nil, fmt.Errorf("failed to load users: %w", err)
    }

    // Check if the user exists in the map
    user, exists := users[username]
    if !exists {
        return nil, fmt.Errorf("user %q not found", username)
    }

    // Delete the user from the map
    delete(users, username)

    // Save the updated user list
    if err := s.saveUsers(users); err != nil {
        return nil, fmt.Errorf("failed to save updated users: %w", err)
    }

    // Return the deleted user data
    return &user, nil
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
