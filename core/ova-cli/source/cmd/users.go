package cmd

import (
	"fmt"
	"os"
	"strings"

	"ova-cli/source/internal/logs"
	"ova-cli/source/internal/repo"

	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

var userLogger = logs.Loggers("Users")

var userCmd = &cobra.Command{
	Use:   "users",
	Short: "Manage users in the local storage",
	Long: `The 'users' command provides subcommands to manage user accounts
including listing, adding, removing, and viewing detailed information about users.`,
	Run: func(cmd *cobra.Command, args []string) {
		_ = cmd.Help()
		userLogger.Info("Please use a subcommand: list, add, rm, info, favorites, playlists, etc.")
	},
}

var userListCmd = &cobra.Command{
	Use:   "list",
	Short: "List all registered users",
	Run: func(cmd *cobra.Command, args []string) {
		repository, err := initRepo()
		if err != nil {
			pterm.Error.Printf("Failed to initialize repository: %v\n", err)
			os.Exit(1)
		}

		users, err := repository.GetAllUsers()
		if err != nil {
			pterm.Error.Printf("Error loading users: %v\n", err)
			os.Exit(1)
		}

		if len(users) == 0 {
			pterm.Info.Println("No users found.")
			return
		}

		pterm.Info.Println("Registered users:")
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

var userAddCmd = &cobra.Command{
	Use:   "add",
	Short: "Add a new user account",
	Run: func(cmd *cobra.Command, args []string) {
		username, _ := pterm.DefaultInteractiveTextInput.
			WithDefaultText("user").
			WithMultiLine(false).
			Show("Enter new username")

		password, _ := pterm.DefaultInteractiveTextInput.
			WithDefaultText("pass").
			WithMultiLine(false).
			Show("Enter password")

		repository, err := initRepo()
		if err != nil {
			pterm.Error.Printf("Failed to initialize repository: %v\n", err)
			os.Exit(1)
		}

		err = repository.CreateUser(username, password, false)
		if err != nil {
			pterm.Error.Printf("Error adding user '%s': %v\n", username, err)
			os.Exit(1)
		}

		pterm.Success.Printf("Successfully added user: %s\n", username)
	},
}

var userRmCmd = &cobra.Command{
	Use:   "rm <username>",
	Short: "Remove a user account",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		username := args[0]

		repository, err := initRepo()
		if err != nil {
			pterm.Error.Printf("Failed to initialize repository: %v\n", err)
			os.Exit(1)
		}

		err = repository.DeleteUser(username)
		if err != nil {
			pterm.Error.Printf("Error removing user '%s': %v\n", username, err)
			os.Exit(1)
		}

		pterm.Success.Printf("User '%s' removed successfully.\n", username)
	},
}

var userInfoCmd = &cobra.Command{
	Use:   "info <username>",
	Short: "Show detailed information about a user",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		username := args[0]

		repository, err := initRepo()
		if err != nil {
			pterm.Error.Printf("Failed to initialize repository: %v\n", err)
			os.Exit(1)
		}

		user, err := repository.GetUserByUsername(username)
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

// initRepo initializes the repo manager from the current working directory, calling Init()
func initRepo() (*repo.RepoManager, error) {
	absPath, err := os.Getwd()
	if err != nil {
		return nil, fmt.Errorf("failed to get current working directory: %w", err)
	}

	repository := repo.NewRepoManager(absPath)
	if err := repository.Init(); err != nil {
		return nil, fmt.Errorf("repository init failed: %w", err)
	}

	return repository, nil
}

// InitCommandUsers adds user-related commands to rootCmd
func InitCommandUsers(rootCmd *cobra.Command) {
	userCmd.AddCommand(userListCmd)
	userCmd.AddCommand(userAddCmd)
	userCmd.AddCommand(userRmCmd)
	userCmd.AddCommand(userInfoCmd)
	rootCmd.AddCommand(userCmd)
}
