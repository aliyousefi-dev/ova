package repo

import "path/filepath"

func (r *RepoManager) GetRootPath() string {
	return r.rootDir
}

func (r *RepoManager) GetRepoDir() string {
	return filepath.Join(r.rootDir, ".ova-repo")
}

func (r *RepoManager) GetStoragePath() string {
	return filepath.Join(r.rootDir, ".ova-repo", "storage")
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
	return filepath.Join(r.rootDir, ".ova-repo", "storage", "sprite_vtt")
}
