package cmd

import (
	"encoding/json"
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
		// Get the repository address from the --repository flag
		repoAddress, _ := cmd.Flags().GetString("repository")

		// If repository address is not provided, use the current working directory
		if repoAddress == "" {
			var err error
			repoAddress, err = os.Getwd()
			if err != nil {
				fmt.Println("Error getting current working directory:", err)
				os.Exit(1)
			}
		}

		// Initialize the repository
		repository := repo.NewRepoManager(repoAddress)
		if err := repository.Init(); err != nil {
			fmt.Println("Failed to initialize repository:", err)
			os.Exit(1)
		}

		users, err := repository.GetAllUsers()
		if err != nil {
			fmt.Printf("Error loading users: %v\n", err)
			os.Exit(1)
		}

		// Check if --json flag is set
		jsonFlag, _ := cmd.Flags().GetBool("json")
		if jsonFlag {
			// If --json is passed, return data in JSON format
			userData := make([]map[string]string, len(users))
			for i, u := range users {
				userData[i] = map[string]string{
					"Username":  u.Username,
					"Roles":     strings.Join(u.Roles, ", "),
					"CreatedAt": u.CreatedAt.Format("2006-01-02 15:04:05"), // Format time for JSON
				}
			}

			// Marshal the user data into JSON format
			jsonData, err := json.Marshal(userData)
			if err != nil {
				fmt.Println("Failed to marshal user data to JSON:", err)
				os.Exit(1)
			}

			// Print the JSON output
			fmt.Println(string(jsonData))
		} else {
			// If no --json flag is passed, display data in a simple table format
			if len(users) == 0 {
				fmt.Println("No users found.")
				return
			}

			fmt.Println("Username\tRoles\tCreated At")
			for _, user := range users {
				fmt.Printf("%s\t%s\t%s\n",
					user.Username,
					strings.Join(user.Roles, ", "),
					user.CreatedAt.Format("2006-01-02 15:04:05"), // Consistent time format
				)
			}
		}
	},
}


var userAddCmd = &cobra.Command{
	Use:   "add",
	Short: "Add a new user account",
	Run: func(cmd *cobra.Command, args []string) {
		// Get flags for username, password, role, repository, and JSON output
		username, _ := cmd.Flags().GetString("user")
		password, _ := cmd.Flags().GetString("pass")
		role, _ := cmd.Flags().GetString("role")
		repoAddress, _ := cmd.Flags().GetString("repository")
		jsonFlag, _ := cmd.Flags().GetBool("json")

		// If username or password is not provided, prompt the user interactively
		if username == "" {
			username, _ = pterm.DefaultInteractiveTextInput.
				WithDefaultText("user").
				WithMultiLine(false).
				Show("Enter new username")
		}

		if password == "" {
			password, _ = pterm.DefaultInteractiveTextInput.
				WithDefaultText("pass").
				WithMultiLine(false).
				Show("Enter password")
		}

		// If role is not provided, set it to default "user"
		if role == "" {
			role = "user"
		}

		// Initialize the repository directly using the repo address
		repository := repo.NewRepoManager(repoAddress)
		if err := repository.Init(); err != nil {
			fmt.Println("Failed to initialize repository:", err)
			os.Exit(1)
		}

		// Create the user using the CreateUser method, which handles hashing and role assignment
		newUser, err := repository.CreateUser(username, password, role)
		if err != nil {
			pterm.Error.Printf("Error adding user '%s': %v\n", username, err)
			os.Exit(1)
		}

		// If --json flag is set, return user data as JSON
		if jsonFlag {
			// Marshal newUser directly into JSON format
			jsonOutput, err := json.Marshal(newUser)
			if err != nil {
				pterm.Error.Printf("Failed to marshal user data to JSON: %v\n", err)
				os.Exit(1)
			}
			fmt.Println(string(jsonOutput))
		} else {
			// If no --json flag, print user info in a readable format
			pterm.Success.Printf("Successfully added user: %s\n", newUser.Username)
			fmt.Printf("Username: %s\nRoles: %s\nCreated At: %s\n", newUser.Username, strings.Join(newUser.Roles, ", "), newUser.CreatedAt.Format("2006-01-02 15:04:05"))
		}
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
	
	userListCmd.Flags().BoolP("json", "j", false, "Output the data in JSON format")
	userListCmd.Flags().StringP("repository", "r", "", "Specify the repository directory")

	// Add flags for the new user
	userAddCmd.Flags().String("user", "", "Username for the new user")
	userAddCmd.Flags().String("pass", "", "Password for the new user")
	userAddCmd.Flags().String("role", "", "Role for the new user (default: 'user')")
	userAddCmd.Flags().StringP("repository", "r", "", "Specify the repository directory") // Kept shorthand -r for repository
	userAddCmd.Flags().BoolP("json", "j", false, "Output the data in JSON format")

	userCmd.AddCommand(userListCmd)
	userCmd.AddCommand(userAddCmd)
	userCmd.AddCommand(userRmCmd)
	userCmd.AddCommand(userInfoCmd)

	rootCmd.AddCommand(userCmd)
}
