package interfaces

import "ova-cli/source/internal/datatypes"

// StorageService defines methods for user and video data operations without context.
type StorageService interface {
	// Initialization
	PrepareStorage() error

	// User management
	CreateUser(user *datatypes.UserData) error
	DeleteUser(username string) error
	GetUserByUsername(username string) (*datatypes.UserData, error)
	GetAllUsers() ([]datatypes.UserData, error)

	// User favorites management
	GetUserSavedVideos(username string) ([]datatypes.VideoData, error)
	AddVideoToSaved(username, videoID string) error
	RemoveVideoFromSaved(username, videoID string) error

	// User playlists management
	AddPlaylistToUser(username string, playlist *datatypes.PlaylistData) error
	GetUserPlaylist(username, playlistSlug string) (*datatypes.PlaylistData, error)
	DeleteUserPlaylist(username, playlistSlug string) error
	AddVideoToPlaylist(username, playlistSlug, videoID string) error
	RemoveVideoFromPlaylist(username, playlistSlug, videoID string) error
	UpdateVideoLocalPath(videoID, newPath string) error
	SetPlaylistsOrder(username string, newOrderSlugs []string) error
	UpdatePlaylistInfo(username, playlistSlug, newTitle, newDescription string) error

	// Video tags management
	AddTagToVideo(videoID, tag string) error
	RemoveTagFromVideo(videoID, tag string) error

	// Video management
	AddVideo(video datatypes.VideoData) error
	DeleteVideo(id string) error
	DeleteAllVideos() error
	GetVideoByID(id string) (*datatypes.VideoData, error)

	SearchVideos(criteria datatypes.VideoSearchCriteria) ([]datatypes.VideoData, error)
	RegisterVideoForStorage(videoPath string) (datatypes.VideoData, error)
	UnregisterVideoFromStorage(videoPath string) error
	GetAllVideos() ([]datatypes.VideoData, error)
	GetSimilarVideos(videoID string) ([]datatypes.VideoData, error)

	// Folder management
	GetFolderList() ([]string, error)
	GetVideosByFolder(folderPath string) ([]datatypes.VideoData, error)
}
