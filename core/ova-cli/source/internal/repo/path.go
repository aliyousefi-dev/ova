package repo

import (
	"fmt"
	"os"
	"path/filepath"
)

// GetExecutableFolderPath returns the folder path of the currently running executable (ovacli).
func (r *RepoManager) GetExecutableFolderPath() (string, error) {
	exePath, err := os.Executable()
	if err != nil {
		return "", fmt.Errorf("failed to get executable path: %w", err)
	}
	exeDir := filepath.Dir(exePath)
	return exeDir, nil
}

func (r *RepoManager) GetRootPath() string {
	return r.rootDir
}

func (r *RepoManager) GetRepoDir() string {
	return filepath.Join(r.rootDir, ".ova-repo")
}

func (r *RepoManager) GetStoragePath() string {
	return filepath.Join(r.rootDir, ".ova-repo", "storage")
}

func (r *RepoManager) GetSSLPath() string {
	return filepath.Join(r.rootDir, ".ova-repo", "ssl")
}

func (r *RepoManager) getRepoConfigFilePath() string {
	return filepath.Join(r.rootDir, ".ova-repo", "configs.json")
}

func (r *RepoManager) getThumbsDir() string {
	return filepath.Join(r.rootDir, ".ova-repo", "storage", "thumbnails")
}

func (r *RepoManager) getPreviewsDir() string {
	return filepath.Join(r.rootDir, ".ova-repo", "storage", "previews")
}

func (r *RepoManager) GetVideoMarkerDir() string {
	return filepath.Join(r.rootDir, ".ova-repo", "storage", "video_markers")
}

func (r *RepoManager) GetStoryboardDir() string {
	return filepath.Join(r.rootDir, ".ova-repo", "storage", "sprite_thumbnails")
}


func (r *RepoManager) GetPreviewFilePathByVideoID(videoID string) string {
	// Get the first two characters of the videoID
	subfolder := videoID[:2]

	// Build the full path to the preview file
	previewPath := filepath.Join(r.getPreviewsDir(), subfolder, videoID+".webm")

	// Return the preview path directly without checking if the file exists
	return previewPath
}

func (r *RepoManager) GetThumbnailFilePathByVideoID(videoID string) string {
	// Get the first two characters of the videoID
	subfolder := videoID[:2]

	// Build the full path to the thumbnail file
	thumbnailPath := filepath.Join(r.getThumbsDir(), subfolder, videoID+".jpg")

	// Return the thumbnail path directly without checking if the file exists
	return thumbnailPath
}

func (r *RepoManager) GetStoryboardFolderPathByVideoID(videoID string) string {
	// Get the first two characters of the videoID to create the subfolder
	subfolder := videoID[:2]

	// Build the full path to the storyboard folder
	storyboardFolderPath := filepath.Join(r.GetStoryboardDir(), subfolder, videoID)

	// Return the storyboard folder path directly without checking if the folder exists
	return storyboardFolderPath
}

func (r *RepoManager) GetVideoMarkerFilePathByVideoID(videoID string) string {
	// Get the first two characters of the videoID to create the subfolder
	subfolder := videoID[:2]

	// Build the full path to the video marker .vtt file
	videoMarkerPath := filepath.Join(r.GetVideoMarkerDir(), subfolder, videoID+".vtt")

	// Return the video marker path directly without checking if the file exists
	return videoMarkerPath
}