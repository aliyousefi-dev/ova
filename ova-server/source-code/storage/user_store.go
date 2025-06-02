package storage

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"

	"ova-server/source-code/storage/datamodels"
)

type UserStore struct {
	storageDir string
}

func newUserStore(storageDir string) *UserStore {
	return &UserStore{storageDir: storageDir}
}

func (s *UserStore) filePath() string {
	return filepath.Join(s.storageDir, "users.json")
}

// LoadUsers loads all users as a map[username]UserData
func (s *UserStore) LoadUsers() (map[string]datamodels.UserData, error) {
	path := s.filePath()

	if _, err := os.Stat(path); os.IsNotExist(err) {
		return make(map[string]datamodels.UserData), nil
	}

	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var users map[string]datamodels.UserData
	if err := json.Unmarshal(data, &users); err != nil {
		return nil, err
	}
	return users, nil
}

// SaveUsers saves all users to disk
func (s *UserStore) SaveUsers(users map[string]datamodels.UserData) error {
	data, err := json.MarshalIndent(users, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(s.filePath(), data, 0644)
}

// AddUser adds a new user to the storage
func (s *UserStore) AddUser(user datamodels.UserData) error {
	users, err := s.LoadUsers()
	if err != nil {
		return err
	}

	if _, exists := users[user.Username]; exists {
		return errors.New("user with this ID already exists")
	}

	users[user.Username] = user
	return s.SaveUsers(users)
}

// RemoveUser removes a user by ID
func (s *UserStore) RemoveUser(username string) error {
	users, err := s.LoadUsers()
	if err != nil {
		return err
	}

	if _, exists := users[username]; !exists {
		return errors.New("user not found")
	}

	delete(users, username)
	return s.SaveUsers(users)
}

// FindUser retrieves a single user by username
func (s *UserStore) FindUser(username string) (*datamodels.UserData, error) {
	users, err := s.LoadUsers()
	if err != nil {
		return nil, err
	}

	user, exists := users[username]
	if !exists {
		return nil, errors.New("user not found")
	}

	return &user, nil
}

// UpdateUser updates an existing user.
// Returns an error if the user does not exist.
func (s *UserStore) UpdateUser(u datamodels.UserData) error {
	users, err := s.LoadUsers()
	if err != nil {
		return err
	}

	key := u.Username

	// Check if user exists, if not return error
	if _, exists := users[key]; !exists {
		return fmt.Errorf("user with username %q does not exist", key)
	}

	// Update user data
	users[key] = u

	return s.SaveUsers(users)
}
