package cmd

import (
	"os"
	"path/filepath"
	"strings"

	"ova-server/source-code/logs"
	"ova-server/source-code/storage"
	"ova-server/source-code/storage/datamodels"

	"github.com/spf13/cobra"
	"golang.org/x/crypto/bcrypt"
)

var userLogger = logs.Loggers("Users")

// userCmd represents the base 'users' command
var userCmd = &cobra.Command{
	Use:   "users",
	Short: "Manage users",
	Run: func(cmd *cobra.Command, args []string) {
		userLogger.Info("Users command invoked: use a subcommand (list, add, rm, info)")
	},
}

// listCmd lists all users
var userListCmd = &cobra.Command{
	Use:   "list",
	Short: "List all users",
	Run: func(cmd *cobra.Command, args []string) {
		storageDir := filepath.Join(".", ".ova-repo", "storage")
		st := storage.NewStorageManager(storageDir)

		users, err := st.Users.LoadUsers()
		if err != nil {
			userLogger.Error("Error loading users: %v", err)
			os.Exit(1)
		}

		if len(users) == 0 {
			userLogger.Info("No users found.")
			return
		}

		userLogger.Info("Registered users:")
		for _, user := range users {
			userLogger.Info("- %s", user.Username)
		}
	},
}

// addCmd adds a new user with username and password
var userAddCmd = &cobra.Command{
	Use:   "add <username> <password>",
	Short: "Add a new user with password",
	Args:  cobra.ExactArgs(2),
	Run: func(cmd *cobra.Command, args []string) {
		username := args[0]
		password := args[1]

		hashBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			userLogger.Error("Error hashing password: %v", err)
			os.Exit(1)
		}
		hashPassword := string(hashBytes)

		storageDir := filepath.Join(".", ".ova-repo", "storage")
		st := storage.NewStorageManager(storageDir)

		newUser := datamodels.GenerateUserJSON(username, hashPassword)
		newUser.Username = username

		if err := st.Users.AddUser(newUser); err != nil {
			userLogger.Error("Error adding user: %v", err)
			os.Exit(1)
		}

		userLogger.Info("Successfully added user: %s", username)
	},
}

// rmCmd removes a user
var userRmCmd = &cobra.Command{
	Use:   "rm <username>",
	Short: "Remove a user by ID",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		username := args[0]
		storageDir := filepath.Join(".", ".ova-repo", "storage")
		st := storage.NewStorageManager(storageDir)

		if err := st.Users.RemoveUser(username); err != nil {
			userLogger.Error("Error removing user: %v", err)
			os.Exit(1)
		}

		userLogger.Info("User with ID %s removed successfully", username)
	},
}

// infoCmd shows info about a user
var userInfoCmd = &cobra.Command{
	Use:   "info <username>",
	Short: "Show information about a user by ID",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		username := args[0]
		storageDir := filepath.Join(".", ".ova-repo", "storage")
		st := storage.NewStorageManager(storageDir)

		users, err := st.Users.LoadUsers()
		if err != nil {
			userLogger.Error("Error loading users: %v", err)
			os.Exit(1)
		}

		user, exists := users[username]
		if !exists {
			userLogger.Warn("User with ID %s not found.", username)
			os.Exit(1)
		}

		userLogger.Info("User Info:")
		userLogger.Info("- Username: %s", user.Username)
		userLogger.Info("- Roles: %s", strings.Join(user.Roles, ", "))
		userLogger.Info("- CreatedAt: %s", user.CreatedAt.Format("2006-01-02 15:04:05"))
		if !user.LastLoginAt.IsZero() {
			userLogger.Info("- LastLoginAt: %s", user.LastLoginAt.Format("2006-01-02 15:04:05"))
		}
		userLogger.Info("- Favorite: %v", user.Favorites)
	},
}

func InitCommandUsers(rootCmd *cobra.Command) {
	userCmd.AddCommand(userListCmd)
	userCmd.AddCommand(userAddCmd)
	userCmd.AddCommand(userRmCmd)
	userCmd.AddCommand(userInfoCmd)
	rootCmd.AddCommand(userCmd)
}
