package thirdparty

import (
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
)

func GenerateRSAKeyNoPass(outputPath string, keySize int) error {
	// Get the path to the OpenSSL executable
	opensslPath, err := GetOpenSSLPath() // Assuming GetOpenSSLPath is implemented as before
	if err != nil {
		return fmt.Errorf("failed to find openssl: %w", err)
	}

	// Build the OpenSSL command to generate an RSA key without a passphrase
	args := []string{"genrsa", "-out", outputPath, fmt.Sprintf("%d", keySize)}

	// Execute the OpenSSL command
	cmd := exec.Command(opensslPath, args...)
	cmdOutput, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("failed to generate RSA key: %w\nOutput: %s", err, string(cmdOutput))
	}

	return nil
}

// GenerateCSR generates a Certificate Signing Request (CSR) using OpenSSL
// with the specified private key and saves it to the given output path.
func GenerateCSR(keyPath string, outputPath string, commonName string) error {
	// Get the path to the OpenSSL executable
	opensslPath, err := GetOpenSSLPath() // Assuming GetOpenSSLPath is implemented as before
	if err != nil {
		return fmt.Errorf("failed to find openssl: %w", err)
	}

	// Build the OpenSSL command to generate the CSR
	subj := fmt.Sprintf("/CN=%s", commonName) // Use the provided Common Name (CN)
	args := []string{
		"req", "-new", "-sha256", "-key", keyPath, "-out", outputPath, "-subj", subj,
	}

	// Execute the OpenSSL command
	cmd := exec.Command(opensslPath, args...)
	cmdOutput, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("failed to generate CSR: %w\nOutput: %s", err, string(cmdOutput))
	}

	// Return the successful result
	fmt.Printf("CSR generated successfully at: %s\n", outputPath)
	return nil
}

// GenerateRSAKey generates an RSA key using OpenSSL with AES256 encryption.
// It accepts a password to encrypt the private key and avoids interactive prompts.
func GenerateRSAKey(outputPath string, keySize int, password string) error {
	// Get the path to the OpenSSL executable
	opensslPath, err := GetOpenSSLPath() // Assuming GetOpenSSLPath is implemented as before
	if err != nil {
		return fmt.Errorf("failed to find openssl: %w", err)
	}

	// Build the OpenSSL command with the -passout option to specify the password
	args := []string{
		"genrsa", "-aes256", "-out", outputPath,  "-passout", "pass:" + password,fmt.Sprintf("%d", keySize),
	}

	// Execute the OpenSSL command
	cmd := exec.Command(opensslPath, args...)
	cmdOutput, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("failed to generate RSA key: %w\nOutput: %s", err, string(cmdOutput))
	}

	return nil
}

// GenerateCACert generates a public CA certificate using OpenSSL
// with the private key (ca-key.pem) and saves it as ca.pem.
// The CN parameter allows the user to specify a custom Common Name for the certificate.
func GenerateCACert(keyPath string, outputPath string, password string, commonName string) error {
	// Get the path to the OpenSSL executable
	opensslPath, err := GetOpenSSLPath() // Assuming GetOpenSSLPath is implemented as before
	if err != nil {
		return fmt.Errorf("failed to find openssl: %w", err)
	}

	// Use the -subj flag to provide non-interactive values for the required fields
	// If the CN parameter is empty, use a default value
	if commonName == "" {
		commonName = "my-ca" // Default CN if none is provided
	}
	
	subj := fmt.Sprintf("/C=ZZ/ST=ZZ/L=ZZ/O=OVA/CN=%s", commonName)

	// Build the OpenSSL command to generate the public CA cert
	args := []string{
		"req", "-new", "-x509", "-sha256", "-days", "365", "-key", keyPath, "-out", outputPath, "-subj", subj, "-passin", fmt.Sprintf("pass:%s", password),
	}

	// Execute the OpenSSL command
	cmd := exec.Command(opensslPath, args...)
	cmdOutput, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("failed to generate CA certificate: %w\nOutput: %s", err, string(cmdOutput))
	}

	// Return the successful result
	fmt.Printf("Public CA certificate generated successfully at: %s\n", outputPath)
	return nil
}




// GenerateExtfile generates an OpenSSL `extfile.cnf` with subjectAltName and extendedKeyUsage (always set to serverAuth).
// It saves the file to the given directory.
func GenerateExtfile(outputDir string, dns string, ip string) error {
	// Path to the extfile.cnf
	extfilePath := filepath.Join(outputDir, "extfile.cnf")

	// Create or overwrite the extfile.cnf
	file, err := os.Create(extfilePath)
	if err != nil {
		return fmt.Errorf("failed to create extfile.cnf: %w", err)
	}
	defer file.Close()

	// Write the subjectAltName with the provided DNS and IP
	_, err = file.WriteString(fmt.Sprintf("subjectAltName=DNS:%s,IP:%s\n", dns, ip))
	if err != nil {
		return fmt.Errorf("failed to write subjectAltName: %w", err)
	}

	// Always write the extendedKeyUsage line with the value "serverAuth"
	_, err = file.WriteString("extendedKeyUsage = serverAuth\n")
	if err != nil {
		return fmt.Errorf("failed to write extendedKeyUsage: %w", err)
	}

	// Successfully created the extfile.cnf
	fmt.Printf("extfile.cnf generated successfully at: %s\n", extfilePath)
	return nil
}

// GenerateCertificate generates a certificate from a CSR using the provided CA certificate and key.
// It also uses an extfile for additional configurations (e.g., subjectAltName, extendedKeyUsage).
func GenerateCertificate(csrPath string, caCertPath string, caKeyPath string, extfilePath string, outputPath string, password string) error {
	// Get the path to the OpenSSL executable
	opensslPath, err := GetOpenSSLPath() // Assuming GetOpenSSLPath is implemented as before
	if err != nil {
		return fmt.Errorf("failed to find openssl: %w", err)
	}

	// Build the OpenSSL command to generate the certificate
	args := []string{
		"x509", "-req", "-sha256", "-days", "365", "-in", csrPath,
		"-CA", caCertPath, "-CAkey", caKeyPath, "-out", outputPath,
		"-extfile", extfilePath, "-CAcreateserial", "-passin", fmt.Sprintf("pass:%s", password),
	}

	// Execute the OpenSSL command
	cmd := exec.Command(opensslPath, args...)
	cmdOutput, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("failed to generate certificate: %w\nOutput: %s", err, string(cmdOutput))
	}

	// Successfully created the certificate
	fmt.Printf("Certificate generated successfully at: %s\n", outputPath)
	return nil
}


// CombineCertsIntoFullchain combines the cert.pem and ca.pem files into a fullchain.pem file.
func CombineCertsIntoFullchain(certPath string, caCertPath string, fullchainPath string) error {
	// Read the content of cert.pem
	certContent, err := ioutil.ReadFile(certPath)
	if err != nil {
		return fmt.Errorf("failed to read cert.pem: %w", err)
	}

	// Read the content of ca.pem
	caCertContent, err := ioutil.ReadFile(caCertPath)
	if err != nil {
		return fmt.Errorf("failed to read ca.pem: %w", err)
	}

	// Combine cert.pem and ca.pem into fullchain.pem
	fullchainContent := append(certContent, caCertContent...)

	// Write the combined content to fullchain.pem
	err = ioutil.WriteFile(fullchainPath, fullchainContent, os.ModePerm)
	if err != nil {
		return fmt.Errorf("failed to write fullchain.pem: %w", err)
	}

	// Successfully created fullchain.pem
	fmt.Printf("fullchain.pem generated successfully at: %s\n", fullchainPath)
	return nil
}