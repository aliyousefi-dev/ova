package interfaces

import "ova-cli/source/internal/datatypes"

// DiskDataStorage defines methods for user and video data operations without context.
type DiskDataStorage interface {

	// User management
	CreateUser(user *datatypes.UserData) error
	DeleteUser(username string) (*datatypes.UserData, error)
	GetUserByUsername(username string) (*datatypes.UserData, error)
	GetAllUsers() ([]datatypes.UserData, error)

	// User favorites management
	GetUserSavedVideos(username string) ([]string, error)
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
	UpdateUserPassword(username, newHashedPassword string) error
	GetUserPlaylistContentVideosCount(username, playlistSlug string) (int, error)
	GetUserPlaylistContentVideosInRange(username, playlistSlug string, start, end int) ([]string, error)

	// Video tags management
	AddTagToVideo(videoID, tag string) error
	RemoveTagFromVideo(videoID, tag string) error

	// Video management
	AddVideo(video datatypes.VideoData) error
	DeleteVideoByID(id string) error
	DeleteAllVideos() error
	GetVideoByID(id string) (*datatypes.VideoData, error)
	GetVideoByPath(path string) (*datatypes.VideoData, error)

	SearchVideos(criteria datatypes.VideoSearchCriteria) ([]datatypes.VideoData, error)
	GetAllVideos() ([]datatypes.VideoData, error)
	GetSimilarVideos(videoID string) ([]datatypes.VideoData, error)

	// Folder management
	GetFolderList() ([]string, error)

	// Spaces Management
	CreateSpace(space *datatypes.SpaceData) error
	GetVideosBySpace(spacePath string) ([]datatypes.VideoData, error)
	GetVideoCountInSpace(spacePath string) (int, error)
	GetVideoIDsBySpaceInRange(spacePath string, start, end int) ([]string, error)

	// New method to get total video count
	GetTotalVideoCount() (int, error)

	// New method to add video to user's watched list
	AddVideoToWatched(username, videoID string) error
	GetUserWatchedVideos(username string) ([]string, error)
	ClearUserWatchedHistory(username string) error

	GetSearchSuggestions(query string) ([]string, error)
}
