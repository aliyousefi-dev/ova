package main

import (
	"ova-cli/source/cmd"

	"github.com/spf13/cobra"
)

func main() {

	var rootCmd = &cobra.Command{
		Use:   "ova-server",
		Short: "OVA Server — a video repository and streaming server",
		Long: `OVA Server manages and serves video collections with metadata repositories,
video streaming, thumbnail delivery, and a CLI for repository, user, and debug management. 
Ideal for efficiently hosting online video libraries.`,
	}

	// common commands
	cmd.InitCommandInit(rootCmd)
	cmd.InitCommandTools(rootCmd)
	cmd.InitCommandCook(rootCmd)
	cmd.InitCommandRepo(rootCmd)

	cmd.InitCommandSSL(rootCmd)

	// server commands
	cmd.InitCommandServe(rootCmd)

	// storage commands
	cmd.InitCommandVideo(rootCmd)
	cmd.InitCommandUsers(rootCmd)

	cmd.InitCommandConfig(rootCmd)

	// version command
	cmd.InitCommandVersion(rootCmd)
	cmd.InitCommandDebug(rootCmd)

	rootCmd.Execute()
	// Initialize the root command and add subcommands
}
