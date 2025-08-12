package cmd

import (
	"fmt"
	"os"
	"ova-cli/source/internal/repo"

	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

var sslCmd = &cobra.Command{
	Use:   "ssl",
	Short: "Manage SSL certificates and CA operations",
	Run: func(cmd *cobra.Command, args []string) {
		// Show help if no subcommand is provided
		_ = cmd.Help()
	},
}

var GenerateCACmd = &cobra.Command{
	Use:   "generate-ca",
	Short: "Generate the RSA key and CA certificate in the SSL folder",
	Run: func(cmd *cobra.Command, args []string) {
		// Get the current working directory
		repoRoot, err := os.Getwd()
		if err != nil {
			pterm.Error.Println("Failed to get working directory:", err)
			return
		}

		// Initialize the RepoManager with the working directory
		repoManager, err := repo.NewRepoManager(repoRoot)
		if err != nil {
			fmt.Println("Failed to initialize repository:", err)
			return
		}

		// Get the CN from the flag (or default to "my-ca" if not provided)
		cn, _ := cmd.Flags().GetString("cn")
		if cn == "" {
			cn = "my-ca" // Default CN if none is provided
		}

		// Get the password from the flag (or default to "yourpassword" if not provided)
		password, _ := cmd.Flags().GetString("password")
		if password == "" {
			password = "ova" // Default password if none is provided
		}

		// Generate the CA (RSA key and CA certificate) with the specified CN and password
		err = repoManager.GenerateCA(password, cn)
		if err != nil {
			fmt.Println("Error generating CA:", err)
			return
		}

		// Notify that the CA generation was successful
		fmt.Println("CA generated successfully!")
	},
}

var GenerateCertCmd = &cobra.Command{
	Use:   "generate-cert",
	Short: "Generate a certificate using the CA's key and certificate",
	Run: func(cmd *cobra.Command, args []string) {
		// Get the current working directory
		repoRoot, err := os.Getwd()
		if err != nil {
			pterm.Error.Println("Failed to get working directory:", err)
			return
		}

		// Initialize the RepoManager with the working directory
		repoManager, err := repo.NewRepoManager(repoRoot)
		if err != nil {
			fmt.Println("Failed to initialize repository:", err)
			return
		}

		// Get the CA password from the flag (or default to "ova" if not provided)
		caPassword, _ := cmd.Flags().GetString("caPassword")
		if caPassword == "" {
			caPassword = "ova" // Default password if none is provided
		}

		// Get the DNS from the flag (or default to "your-dns.record" if not provided)
		dns, _ := cmd.Flags().GetString("dns")
		if dns == "" {
			dns = "your-dns.record" // Default DNS if none is provided
		}

		// Get the IP from the flag (or default to "127.0.0.1" if not provided)
		ip, _ := cmd.Flags().GetString("ip")
		if ip == "" {
			ip = "127.0.0.1" // Default IP if none is provided
		}

		// Generate the certificate using the CA's key and certificate
		err = repoManager.GenerateCertificate(dns, ip, caPassword)
		if err != nil {
			fmt.Println("Error generating certificate:", err)
			return
		}

		// Notify that the certificate generation was successful
		fmt.Println("Certificate generated successfully!")
	},
}

func InitCommandSSL(rootCmd *cobra.Command) {

	rootCmd.AddCommand(sslCmd)

	sslCmd.AddCommand(GenerateCACmd)
	sslCmd.AddCommand(GenerateCertCmd)

	GenerateCACmd.Flags().String("cn", "", "Common Name (CN) for the CA certificate (default: 'my-ca')")
	GenerateCACmd.Flags().String("password", "", "Password for the private key (default: 'yourpassword')")

	// Adding flags for GenerateCertCmd
	GenerateCertCmd.Flags().String("caPassword", "", "Password for the CA's private key (default: 'ova')")
	GenerateCertCmd.Flags().String("dns", "", "DNS record for the certificate (default: 'your-dns.record')")
	GenerateCertCmd.Flags().String("ip", "", "IP address for the certificate (default: '127.0.0.1')")
}
