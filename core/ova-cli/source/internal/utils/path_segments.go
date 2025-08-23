package utils

import (
	"path/filepath"
	"strings"
)

type PathSegments struct {
	Root    string `json:"root"`
	Subroot string `json:"subroot"`
}

func GetPathSegments(path string) PathSegments {
	// Use filepath to normalize path (works across platforms)
	path = filepath.ToSlash(path)

	// Split the path into segments
	segments := strings.SplitN(path, "/", 2)

	result := PathSegments{}

	if segments[0] == "" {
		result.Root = "."
	} else {
		result.Root = segments[0]
	}

	if len(segments) > 1 {
		if segments[1] == "" {
			result.Subroot = "root"
		} else {
			result.Subroot = segments[1]
		}
	} else {
		result.Subroot = "root"
	}

	return result
}
