package utils

import "strings"

type PathSegments struct {
	Root    string `json:"root"`
	Subroot string `json:"subroot"`
}

func GetPathSegments(path string) PathSegments {
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
