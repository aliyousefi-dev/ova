package cmd

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"ova-cli/source/internal/datastorage/jsondb"
	"ova-cli/source/internal/datatypes"
	"ova-cli/source/internal/logs"

	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
	"golang.org/x/crypto/bcrypt"
)

var userLogger = logs.Loggers("Users")

// userCmd represents the base 'users' command
var userCmd = &cobra.Command{
	Use:   "users",
	Short: "Manage users in the local storage",
	Long: `The 'users' command provides subcommands to manage user accounts
including listing, adding, removing, and viewing detailed information about users.`,
	Run: func(cmd *cobra.Command, args []string) {
		// If no subcommand is provided, print usage and a hint
		_ = cmd.Help() // Print the help message for the users command
		userLogger.Info("Please use a subcommand: list, add, rm, info, favorites, playlists, etc.")
	},
}

// userListCmd lists all users
var userListCmd = &cobra.Command{
	Use:   "list",
	Short: "List all registered users",
	Long:  "Displays a list of all user accounts currently stored in the system.",
	Run: func(cmd *cobra.Command, args []string) {
		// Initialize LocalStorage
		st, err := initLocalStorage()
		if err != nil {
			pterm.Error.Printf("Failed to initialize storage: %v\n", err)
			os.Exit(1)
		}

		users, err := st.GetAllUsers()
		if err != nil {
			pterm.Error.Printf("Error loading users: %v\n", err)
			os.Exit(1)
		}

		if len(users) == 0 {
			pterm.Info.Println("No users found.")
			return
		}

		pterm.Info.Println("Registered users:")
		// Use pterm table for output
		rows := pterm.TableData{{"Username", "Roles", "Created At"}}
		for _, user := range users {
			rows = append(rows, []string{
				user.Username,
				strings.Join(user.Roles, ", "),
				user.CreatedAt.Format("2006-01-02 15:04:05"),
			})
		}
		_ = pterm.DefaultTable.WithHasHeader().WithData(rows).Render()
	},
}

// userAddCmd adds a new user with a username and password
var userAddCmd = &cobra.Command{
	Use:   "add",
	Short: "Add a new user account",
	Long:  "Adds a new user account to the system with a username and a hashed password.",
	Args:  cobra.NoArgs,
	Run: func(cmd *cobra.Command, args []string) {
		// Prompt for username
		username, _ := pterm.DefaultInteractiveTextInput.
			WithDefaultText("user").
			WithMultiLine(false).
			Show("Enter new username")

		// Prompt for password
		password, _ := pterm.DefaultInteractiveTextInput.
			WithDefaultText("pass").
			WithMultiLine(false).
			Show("Enter password")

		// Hash the password securely using bcrypt
		hashBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			pterm.Error.Printf("Error hashing password: %v\n", err)
			os.Exit(1)
		}
		hashedPassword := string(hashBytes)

		// Initialize storage
		st, err := initLocalStorage()
		if err != nil {
			pterm.Error.Printf("Failed to initialize storage: %v\n", err)
			os.Exit(1)
		}

		// Create user data
		newUser := datatypes.NewUserData(username, hashedPassword)

		// Try creating the user
		if err := st.CreateUser(&newUser); err != nil {
			pterm.Error.Printf("Error adding user '%s': %v\n", username, err)
			os.Exit(1)
		}

		pterm.Success.Printf("Successfully added user: %s\n", username)
	},
}

// userRmCmd removes a user by username
var userRmCmd = &cobra.Command{
	Use:   "rm <username>",
	Short: "Remove a user account",
	Long:  "Removes a user account from the system, identified by its username.",
	Args:  cobra.ExactArgs(1), // Requires exactly 1 argument: username
	Run: func(cmd *cobra.Command, args []string) {
		username := args[0]

		// Initialize LocalStorage
		st, err := initLocalStorage()
		if err != nil {
			pterm.Error.Printf("Failed to initialize storage: %v\n", err)
			os.Exit(1)
		}

		if err := st.DeleteUser(username); err != nil {
			pterm.Error.Printf("Error removing user '%s': %v\n", username, err)
			os.Exit(1)
		}

		pterm.Success.Printf("User '%s' removed successfully.\n", username)
	},
}

// userInfoCmd shows detailed information about a user
var userInfoCmd = &cobra.Command{
	Use:   "info <username>",
	Short: "Show detailed information about a user",
	Long:  "Retrieves and displays comprehensive details for a specific user, including roles, creation date, favorites, and playlists.",
	Args:  cobra.ExactArgs(1), // Requires exactly 1 argument: username
	Run: func(cmd *cobra.Command, args []string) {
		username := args[0]

		// Initialize LocalStorage
		st, err := initLocalStorage()
		if err != nil {
			pterm.Error.Printf("Failed to initialize storage: %v\n", err)
			os.Exit(1)
		}

		user, err := st.GetUserByUsername(username)
		if err != nil {
			pterm.Error.Printf("Error retrieving user '%s': %v\n", username, err)
			os.Exit(1)
		}

		pterm.Info.Printf("User Info for: %s\n", user.Username)
		pterm.Println(strings.Repeat("-", 30))

		pterm.DefaultSection.Println("Username:", user.Username)
		pterm.DefaultSection.Println("Roles:", strings.Join(user.Roles, ", "))
		pterm.DefaultSection.Println("Created At:", user.CreatedAt.Format("2006-01-02 15:04:05 MST"))

		if !user.LastLoginAt.IsZero() {
			pterm.DefaultSection.Println("Last Login At:", user.LastLoginAt.Format("2006-01-02 15:04:05 MST"))
		} else {
			pterm.DefaultSection.Println("Last Login At: (Never)")
		}

		// Display Favorites
		if len(user.Favorites) > 0 {
			pterm.DefaultSection.Println("Favorites:")
			for i, favID := range user.Favorites {
				pterm.Println("  -", favID)
				if i >= 4 && len(user.Favorites) > 5 {
					pterm.Println("  ...and", len(user.Favorites)-5, "more")
					break
				}
			}
		} else {
			pterm.DefaultSection.Println("Favorites: (none)")
		}

		// Display Playlists
		if len(user.Playlists) > 0 {
			pterm.DefaultSection.Println("Playlists:")
			for i, pl := range user.Playlists {
				pterm.Println("  -", pl.Title, "(Slug:", pl.Slug+", Videos:", len(pl.VideoIDs), ")")
				if i >= 4 && len(user.Playlists) > 5 {
					pterm.Println("  ...and", len(user.Playlists)-5, "more")
					break
				}
			}
		} else {
			pterm.DefaultSection.Println("Playlists: (none)")
		}
	},
}

// initLocalStorage is a helper function to avoid code duplication.
func initLocalStorage() (*jsondb.JsonDB, error) {
	repoRoot, err := os.Getwd()
	if err != nil {
		return nil, fmt.Errorf("failed to get current working directory: %w", err)
	}
	storageDir := filepath.Join(repoRoot, ".ova-repo", "storage")
	return jsondb.NewJsonDB(storageDir), nil
}

// InitCommandUsers initializes the 'users' command and its subcommands.
func InitCommandUsers(rootCmd *cobra.Command) {
	userCmd.AddCommand(userListCmd)
	userCmd.AddCommand(userAddCmd)
	userCmd.AddCommand(userRmCmd)
	userCmd.AddCommand(userInfoCmd)
	// Add more subcommands for favorites/playlists here if needed
	rootCmd.AddCommand(userCmd)
}
