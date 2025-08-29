package jsondb

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
	"path/filepath"
	"strings"
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
	if _, exists := spaces[space.SpaceName]; exists {
		return fmt.Errorf("space with name %q already exists", space.SpaceName)
	}

	// Add the new space
	spaces[space.SpaceName] = *space

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

func (s *JsonDB) AddVideoIDToSpace(videoId, filePath string) error {

	// 1. Load all spaces
	spaces, err := s.loadSpaces()
	if err != nil {
		return err
	}

	// 2. Normalize path separators
	filePath = filepath.ToSlash(filePath)

	// Determine if the path is a file in the root of a space or a path with groups
	var spaceName string
	var groupPath []string

	if strings.Contains(filePath, "/") {
		// Path with space and groups (e.g., "New/input.mp4")
		pathParts := strings.Split(filePath, "/")
		if len(pathParts) < 2 {
			return fmt.Errorf("invalid file path format: %s", filePath)
		}
		spaceName = pathParts[0]
		groupPath = pathParts[1 : len(pathParts)-1]
	} else {
		// Path is just a filename, so it goes to the "root" space
		spaceName = "root"
		groupPath = []string{}
	}

	// 3. Find the target space
	space, ok := spaces[spaceName]
	if !ok {
		return fmt.Errorf("space not found: %s", spaceName)
	}

	// 4. Find the root group. Every space should have one.
	var rootGroup *datatypes.SpaceGroup
	for i := range space.Groups {
		if space.Groups[i].GroupName == "root" {
			rootGroup = &space.Groups[i]
			break
		}
	}

	if rootGroup == nil {
		return fmt.Errorf("root group not found in space: %s", spaceName)
	}

	// 5. Find the correct group starting from the root group.
	var targetGroup *datatypes.SpaceGroup
	if len(groupPath) == 0 {
		// If there is no group path, add the video directly to the root group.
		targetGroup = rootGroup
	} else {
		// Otherwise, find or create the subgroup path.
		targetGroup = findOrCreateGroup(&rootGroup.Groups, groupPath)
	}

	if targetGroup == nil {
		return fmt.Errorf("group path not found or created: %s", strings.Join(groupPath, "/"))
	}

	// 6. Add the videoId to the target group
	for _, id := range targetGroup.VideoIds {
		if id == videoId {
			return nil // Video ID already exists, do nothing.
		}
	}
	targetGroup.VideoIds = append(targetGroup.VideoIds, videoId)

	// 7. Update the map and save the data
	spaces[spaceName] = space
	return s.saveSpaces(spaces)
}

func findOrCreateGroup(groups *[]datatypes.SpaceGroup, pathParts []string) *datatypes.SpaceGroup {
	if len(pathParts) == 0 {
		return nil
	}

	for i := range *groups {
		if (*groups)[i].GroupName == pathParts[0] {
			if len(pathParts) == 1 {
				return &(*groups)[i]
			}
			// If group found, recurse into its subgroups
			return findOrCreateGroup(&(*groups)[i].Groups, pathParts[1:])
		}
	}

	// If we reach here, the group was not found, so we create it.
	newGroup := datatypes.SpaceGroup{
		GroupName: pathParts[0],
		Groups:    []datatypes.SpaceGroup{},
		VideoIds:  []string{},
		QualityControl: datatypes.QualityControl{
			Enabled:          false,
			DraftVideoIds:    []string{},
			AcceptedVideoIds: []string{},
		},
	}
	*groups = append(*groups, newGroup)

	// Get a reference to the newly created group.
	newlyCreatedGroup := &(*groups)[len(*groups)-1]

	// If there are more parts in the path, recurse into the new group's subgroups.
	if len(pathParts) > 1 {
		return findOrCreateGroup(&newlyCreatedGroup.Groups, pathParts[1:])
	}

	// This is the last part of the path, so return the pointer to the group.
	return newlyCreatedGroup
}

// GetVideosBySpace returns all videos located inside the specified folder path.
// The folderPath is expected to be a relative path with slashes normalized.
// If folderPath is empty, it returns videos in the root folder.
func (s *JsonDB) GetVideosBySpace(spacePath string) ([]datatypes.VideoData, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	videosMap, err := s.loadVideos()
	if err != nil {
		return nil, fmt.Errorf("failed to load videos: %w", err)
	}

	// Normalize folder path to slash-separated and trimmed, empty string means root
	spacePath = filepath.ToSlash(strings.Trim(spacePath, "/"))

	var results []datatypes.VideoData
	for _, video := range videosMap {
		// Normalize video's folder path
		videoFolder := filepath.ToSlash(video.OwnedSpace)
		videoFolder = strings.Trim(videoFolder, "/")
		if videoFolder == "." {
			videoFolder = ""
		}

		// Match normalized folder paths
		if videoFolder == spacePath {
			results = append(results, video)
		}
	}

	return results, nil
}

func (s *JsonDB) GetVideoCountInSpace(spacePath string) (int, error) {
	// Get all videos in the specified space
	videos, err := s.GetVideosBySpace(spacePath)
	if err != nil {
		return 0, fmt.Errorf("failed to retrieve videos for space '%s': %w", spacePath, err)
	}

	// Return the count of videos in the space
	return len(videos), nil
}

func (s *JsonDB) GetVideoIDsBySpaceInRange(spacePath string, start, end int) ([]string, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Load all videos from the database
	videosMap, err := s.loadVideos()
	if err != nil {
		return nil, fmt.Errorf("failed to load videos: %w", err)
	}

	// Normalize space path to slash-separated and trimmed
	spacePath = filepath.ToSlash(strings.Trim(spacePath, "/"))

	var videoIDs []string
	for _, video := range videosMap {
		// Normalize video's space path
		videoFolder := filepath.ToSlash(video.OwnedSpace)
		videoFolder = strings.Trim(videoFolder, "/")
		if videoFolder == "." {
			videoFolder = ""
		}

		// Match the normalized space path
		if videoFolder == spacePath {
			videoIDs = append(videoIDs, video.VideoID) // Collect video ID
		}
	}

	// Validate the range
	if start < 0 || end > len(videoIDs) || start >= end {
		return nil, fmt.Errorf("invalid range [%d, %d)", start, end)
	}

	// Return the video IDs within the specified range
	return videoIDs[start:end], nil
}
