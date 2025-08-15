package cmd

import (
	"ova-cli/source/internal/server"

	"github.com/spf13/cobra"
)

var docsCmd = &cobra.Command{
	Use:   "docs",
	Short: "Start a server to serve documentation",
	Run: func(cmd *cobra.Command, args []string) {
		// Call the server's StartDocServer method
		server.StartDocServer()
	},
}

func InitCommandDocs(rootCmd *cobra.Command) {
	rootCmd.AddCommand(docsCmd)
}
