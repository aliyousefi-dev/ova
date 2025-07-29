package cmd

import (
	"fmt"
	"os"
	"ova-cli/source/internal/repo"

	"github.com/pterm/pterm" // Assuming pterm is used for pretty printing/logging
	"github.com/spf13/cobra"
)

// debugCmd is the root debug command
var debugCmd = &cobra.Command{	
	Use:   "debug",
	Short: "Print debugging information for the application",
	Run: func(cmd *cobra.Command, args []string) {
		// This will be triggered when no subcommands are provided for `debug`
		fmt.Println("Debug command invoked: use a subcommand like 'search' to perform operations.")
	},
}

// searchCmd is the subcommand for searching
var searchString string

var searchCmd = &cobra.Command{
	Use:   "search",
	Short: "Search for videos based on a query",
	Run: func(cmd *cobra.Command, args []string) {
		// Get the current working directory
		repoRoot, err := os.Getwd()
		if err != nil {
			pterm.Error.Println("Failed to get working directory:", err)
			return
		}

		// Initialize the RepoManager
		repoManager, err := repo.NewRepoManager(repoRoot)
		if err != nil {
			fmt.Println("Failed to initialize repository:", err)
			return
		}

		// Perform the search for suggestions based on the query
		suggestions, err := repoManager.GetSearchSuggestions(searchString)
		if err != nil {
			pterm.Error.Println("Failed to get search suggestions:", err)
			return
		}

		// Print search results (or an appropriate message if no results)
		if len(suggestions) > 0 {
			pterm.Success.Println("Search results for query:", searchString)
			for _, suggestion := range suggestions {
				pterm.Info.Println(suggestion)
			}
		} else {
			pterm.Warning.Println("No search suggestions found for query:", searchString)
		}
	},
}


func InitCommandDebug(rootCmd *cobra.Command) {
	// Add the root `debug` command
	rootCmd.AddCommand(debugCmd)

	searchCmd.Flags().StringVarP(&searchString, "query", "q", "", "The search query string")

	// Add `search` as a subcommand of `debug`
	debugCmd.AddCommand(searchCmd)
}
