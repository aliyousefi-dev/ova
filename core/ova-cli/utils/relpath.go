package utils

import (
	"path/filepath"
)

// MakeRelative takes a root directory and a target file path,
// and returns the path to the file relative to the root.
func MakeRelative(rootPath, filePath string) (string, error) {
	absRoot, err := filepath.Abs(rootPath)
	if err != nil {
		return "", err
	}

	absFile, err := filepath.Abs(filePath)
	if err != nil {
		return "", err
	}

	rel, err := filepath.Rel(absRoot, absFile)
	if err != nil {
		return "", err
	}

	return rel, nil
}
