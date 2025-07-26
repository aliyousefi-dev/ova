package cmd

import (
	"fmt"
	"os"
	"ova-cli/source/internal/logs"
	"ova-cli/source/internal/repo"
	"ova-cli/source/internal/thirdparty"

	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

var toolsLogger = logs.Loggers("Tools")

// root tools command
var toolsCmd = &cobra.Command{
	Use:   "tools",
	Short: "Various utility tools commands",
}


var toolsThumbnailCmd = &cobra.Command{
	Use:   "thumbnail <video-path> <thumbnail-output-path>",
	Short: "Generate a thumbnail image from a video",
	Args:  cobra.ExactArgs(2),
	Run: func(cmd *cobra.Command, args []string) {
		videoPath := args[0]
		thumbnailPath := args[1]

		// Default time
		timePos, _ := cmd.Flags().GetFloat64("time")

		err := thirdparty.GenerateImageFromVideo(videoPath, thumbnailPath, timePos)
		if err != nil {
			toolsLogger.Error("Failed to generate thumbnail: %v", err)
			return
		}

		toolsLogger.Info("Thumbnail generated: %s", thumbnailPath)
		fmt.Println(thumbnailPath) // Optionally print to stdout
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


var toolsPreviewCmd = &cobra.Command{
	Use:   "preview <video-path> <preview-output-path>",
	Short: "Generate a short WebM preview clip from a video",
	Args:  cobra.ExactArgs(2),
	Run: func(cmd *cobra.Command, args []string) {
		videoPath := args[0]
		outputPath := args[1]

		startTime, _ := cmd.Flags().GetFloat64("start")
		duration, _ := cmd.Flags().GetFloat64("duration")

		err := thirdparty.GenerateWebMFromVideo(videoPath, outputPath, startTime, duration)
		if err != nil {
			toolsLogger.Error("Failed to generate preview: %v", err)
			return
		}

		toolsLogger.Info("Preview generated: %s", outputPath)
		fmt.Println(outputPath) // Print to stdout for scripting
	},
}


// GetMP4Info runs mp4info on the provided video path and returns the output as string.
var toolsInfoCmd = &cobra.Command{
	Use:   "info <video-path>",
	Short: "Print technical metadata of an MP4 file using mp4info",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		videoPath := args[0]

		info, err := thirdparty.GetMP4Info(videoPath)
		if err != nil {
			toolsLogger.Error("Failed to get MP4 info: %v", err)
			return
		}

		fmt.Println(info) // Final clean stdout output
	},
}


var toolsConvertCmd = &cobra.Command{
	Use:   "convert <input-path> <output-path>",
	Short: "Convert a video to MP4 format using ffmpeg",
	Args:  cobra.ExactArgs(2),
	Run: func(cmd *cobra.Command, args []string) {
		inputPath := args[0]
		outputPath := args[1]

		err := thirdparty.ConvertToMP4(inputPath, outputPath)
		if err != nil {
			toolsLogger.Error("Failed to convert to MP4: %v", err)
			return
		}

		toolsLogger.Info("Converted to MP4: %s", outputPath)
		fmt.Println(outputPath) // For scripting
	},
}



// InitCommandTools initializes the tools command and its subcommands
func InitCommandTools(rootCmd *cobra.Command) {
	rootCmd.AddCommand(toolsCmd)
	toolsCmd.AddCommand(toolsThumbnailCmd)
	toolsCmd.AddCommand(toolsPreviewCmd)
	toolsCmd.AddCommand(toolsInfoCmd)
	toolsCmd.AddCommand(toolsConvertCmd)
	toolsCmd.AddCommand(GenerateCACmd)
	toolsCmd.AddCommand(GenerateCertCmd)

	GenerateCACmd.Flags().String("cn", "", "Common Name (CN) for the CA certificate (default: 'my-ca')")
	GenerateCACmd.Flags().String("password", "", "Password for the private key (default: 'yourpassword')")

	// Adding flags for GenerateCertCmd
	GenerateCertCmd.Flags().String("caPassword", "", "Password for the CA's private key (default: 'ova')")
	GenerateCertCmd.Flags().String("dns", "", "DNS record for the certificate (default: 'your-dns.record')")
	GenerateCertCmd.Flags().String("ip", "", "IP address for the certificate (default: '127.0.0.1')")

	toolsThumbnailCmd.Flags().Float64("time", 5.0, "Time position (in seconds) for thumbnail")

	toolsPreviewCmd.Flags().Float64("start", 0.0, "Start time (in seconds) for preview")
	toolsPreviewCmd.Flags().Float64("duration", 5.0, "Duration (in seconds) of preview clip")
}
