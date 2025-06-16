package cmd

import (
	"os"
	"strconv"
	"strings"

	"ova-cli/source/internal/repository"

	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

// configCmd is the parent: ovacli config
var configCmd = &cobra.Command{
	Use:   "config",
	Short: "Configuration related commands",
}

// configServerCmd handles: ovacli config server <host:port>
var configServerCmd = &cobra.Command{
	Use:   "server [host:port]",
	Short: "Set the server host and port in the config",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		address := args[0]

		parts := strings.Split(address, ":")
		if len(parts) != 2 {
			pterm.Error.Println("Invalid address format. Use host:port (e.g., 127.0.0.1:5050)")
			os.Exit(1)
		}

		host := parts[0]
		portStr := parts[1]

		port, err := strconv.Atoi(portStr)
		if err != nil {
			pterm.Error.Printf("Invalid port: %s\n", portStr)
			os.Exit(1)
		}

		// Load current config
		cfg, err := repository.LoadRepoConfig(".")
		if err != nil {
			pterm.Error.Printf("Failed to load config: %v\n", err)
			os.Exit(1)
		}

		cfg.ServerHost = host
		cfg.ServerPort = port

		err = repository.SaveRepoConfig(".", cfg)
		if err != nil {
			pterm.Error.Printf("Failed to save config: %v\n", err)
			os.Exit(1)
		}

		pterm.Success.Printf("Server address set to %s:%d\n", host, port)
	},
}

func InitCommandConfig(rootCmd *cobra.Command) {
	rootCmd.AddCommand(configCmd)
	configCmd.AddCommand(configServerCmd)
}
