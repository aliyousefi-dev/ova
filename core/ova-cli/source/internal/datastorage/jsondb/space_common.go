package jsondb

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
)

// CreateSpace adds a new space if a space with the same name does not already exist.
// Returns an error if a space with the provided name already exists.
func (s *JsonDB) CreateSpace(space *datatypes.SpaceData) error {
	// Load existing spaces
	spaces, err := s.loadSpaces()
	if err != nil {
		return fmt.Errorf("failed to load spaces: %w", err)
	}

	// Check if space with the same name already exists
	if _, exists := spaces[space.Name]; exists {
		return fmt.Errorf("space with name %q already exists", space.Name)
	}

	// Add the new space
	spaces[space.Name] = *space

	// Save updated spaces
	return s.saveSpaces(spaces)
}

func (s *JsonDB) DeleteSpace(name string) error {
	// Load existing spaces
	spaces, err := s.loadSpaces()
	if err != nil {
		return fmt.Errorf("failed to load spaces: %w", err)
	}

	// Check if space with the given name exists
	if _, exists := spaces[name]; !exists {
		return fmt.Errorf("space with name %q does not exist", name)
	}

	// Delete the space
	delete(spaces, name)

	// Save updated spaces
	return s.saveSpaces(spaces)
}

func (s *JsonDB) UpdateSpace(name string, updatedSpace *datatypes.SpaceData) error {
	// Load existing spaces
	spaces, err := s.loadSpaces()
	if err != nil {
		return fmt.Errorf("failed to load spaces: %w", err)
	}

	// Check if space with the given name exists
	if _, exists := spaces[name]; !exists {
		return fmt.Errorf("space with name %q does not exist", name)
	}

	// Update the space
	spaces[name] = *updatedSpace

	// Save updated spaces
	return s.saveSpaces(spaces)
}

func (s *JsonDB) GetAllSpaces() (map[string]datatypes.SpaceData, error) {
	// Load existing spaces
	spaces, err := s.loadSpaces()
	if err != nil {
		return nil, fmt.Errorf("failed to load spaces: %w", err)
	}
	return spaces, nil
}
