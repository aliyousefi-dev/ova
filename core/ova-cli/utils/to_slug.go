package utils

import (
	"regexp"
	"strings"
)

func ToSlug(title string) string {
	title = strings.ToLower(title)
	title = strings.TrimSpace(title)
	// Replace spaces and underscores with hyphens
	title = strings.ReplaceAll(title, " ", "-")
	title = strings.ReplaceAll(title, "_", "-")

	// Remove all non-alphanumeric and non-hyphen characters
	re := regexp.MustCompile("[^a-z0-9-]")
	title = re.ReplaceAllString(title, "")

	// Remove duplicate hyphens
	re = regexp.MustCompile("-+")
	title = re.ReplaceAllString(title, "-")

	return title
}
