package cmd

import (
	"path/filepath"

	"ova-server/source-code/logs"
	"ova-server/source-code/storage"
	"ova-server/source-code/storage/datamodels"

	"github.com/spf13/cobra"
)

var playlistLogger = logs.Loggers("Playlist")

// playlistCmd represents the 'playlist' command
var playlistCmd = &cobra.Command{
	Use:   "playlist",
	Short: "Manage playlists",
	Run: func(cmd *cobra.Command, args []string) {
		playlistLogger.Info("Playlist command invoked: use a subcommand (list, add, rm, info)")
	},
}

// playlists list
var playlistListCmd = &cobra.Command{
	Use:   "list",
	Short: "List all playlists",
	Run: func(cmd *cobra.Command, args []string) {
		storageDir := filepath.Join(".", ".ova-repo", "storage")
		st := storage.NewStorageManager(storageDir)

		playlists, err := st.Playlists.LoadPlaylists()
		if err != nil {
			playlistLogger.Error("Error loading playlists: %v", err)
			return
		}

		playlistLogger.Info("Playlists:")
		for _, p := range playlists {
			playlistLogger.Info("- %s", p.Title)
		}
	},
}

// playlists add
var playlistAddCmd = &cobra.Command{
	Use:   "add <playlist-name>",
	Short: "Add a new playlist",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		playlistName := args[0]
		storageDir := filepath.Join(".", ".ova-repo", "storage")
		st := storage.NewStorageManager(storageDir)

		newPlaylist := datamodels.GeneratePlaylistJSON(playlistName)
		if err := st.Playlists.AddPlaylist(newPlaylist); err != nil {
			playlistLogger.Error("Error adding playlist: %v", err)
			return
		}
		playlistLogger.Info("Added new playlist: %s", playlistName)
	},
}

// playlist rm <playlist>
var playlistRmCmd = &cobra.Command{
	Use:   "rm <playlist>",
	Short: "Remove a playlist",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		playlistID := args[0]
		storageDir := filepath.Join(".", ".ova-repo", "storage")
		st := storage.NewStorageManager(storageDir)

		err := st.Playlists.RemovePlaylist(playlistID)
		if err != nil {
			playlistLogger.Error("Error removing playlist: %v", err)
			return
		}
		playlistLogger.Info("Removed playlist: %s", playlistID)
	},
}

// playlist info <playlist>
var playlistInfoCmd = &cobra.Command{
	Use:   "info <playlist>",
	Short: "Show information about a playlist",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		playlistID := args[0]
		storageDir := filepath.Join(".", ".ova-repo", "storage")
		st := storage.NewStorageManager(storageDir)

		playlist, err := st.Playlists.FindPlaylistBySlug(playlistID)
		if err != nil {
			playlistLogger.Error("Error finding playlist: %v", err)
			return
		}

		playlistLogger.Info("Playlist Info:\nTitle: %s\nDescription: %s\nVideo IDs: %v",
			playlist.Title, playlist.Description, playlist.VideoIDs)
	},
}

// InitCommandPlaylists initializes the playlist commands and adds them to rootCmd
func InitCommandPlaylists(rootCmd *cobra.Command) {
	playlistCmd.AddCommand(playlistListCmd)
	playlistCmd.AddCommand(playlistAddCmd)
	playlistCmd.AddCommand(playlistRmCmd)
	playlistCmd.AddCommand(playlistInfoCmd)

	rootCmd.AddCommand(playlistCmd)
}
