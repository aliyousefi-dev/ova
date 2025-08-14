package repo

import (
	"fmt"
	"os"
	"ova-cli/source/internal/thirdparty"
	"path/filepath"
)

// GenerateCA generates the RSA key (ca-key.pem) and the public CA certificate (ca.pem)
// It now accepts a CN (Common Name) for the CA certificate.
func (r *RepoManager) GenerateCA(password string, commonName string) error {
	// Get the path to the SSL folder
	sslFolderPath := r.GetSSLPath()
	caPath := filepath.Join(sslFolderPath, "self-ca")

	// Check if the CA folder exists, and create it if it doesn't
	if _, err := os.Stat(caPath); os.IsNotExist(err) {
		// Create the directory if it does not exist
		err := os.MkdirAll(caPath, os.ModePerm)
		if err != nil {
			return fmt.Errorf("failed to create CA folder: %w", err)
		}
	}

	// Generate the RSA key (ca-key.pem) with the provided password
	caKeyPath := filepath.Join(caPath, "ca-key.pem")
	err := thirdparty.GenerateRSAKey(caKeyPath, 4096, password)
	if err != nil {
		return fmt.Errorf("failed to generate RSA key: %w", err)
	}

	// Now generate the public CA certificate (ca.pem) using the private key (ca-key.pem)
	caCertPath := filepath.Join(caPath, "ca.pem")
	err = thirdparty.GenerateCACert(caKeyPath, caCertPath, password, commonName) // Pass the CN to GenerateCACert
	if err != nil {
		return fmt.Errorf("failed to generate CA certificate: %w", err)
	}

	return nil
}

// GenerateCertificate generates a certificate from a CSR using the CA's key and certificate
func (r *RepoManager) GenerateCertificate(dns, ip, password string) error {
	// Get the path to the SSL folder
	sslFolderPath := r.GetSSLPath()

	// Generate the certificate key (cert-key.pem) without passphrase
	certKeyPath := filepath.Join(sslFolderPath, "cert-key.pem")
	err := thirdparty.GenerateRSAKeyNoPass(certKeyPath, 4096)
	if err != nil {
		return fmt.Errorf("failed to generate certificate key: %w", err)
	}

	// Generate the CSR (cert.csr) using the cert-key.pem
	csrPath := filepath.Join(sslFolderPath, "cert.csr")
	commonName := "Netfilters" // You can change this to a dynamic value if needed
	err = thirdparty.GenerateCSR(certKeyPath, csrPath, commonName)
	if err != nil {
		return fmt.Errorf("failed to generate CSR: %w", err)
	}

	// Create the extfile.cnf with subjectAltName and extendedKeyUsage using the provided dns and ip
	extfilePath := filepath.Join(sslFolderPath, "extfile.cnf")
	err = thirdparty.GenerateExtfile(sslFolderPath, dns, ip)
	if err != nil {
		return fmt.Errorf("failed to generate extfile.cnf: %w", err)
	}

	caPath := filepath.Join(sslFolderPath, "self-ca")

	// Get the CA certificate path
	caCertPath := filepath.Join(caPath, "ca.pem")
	// Get the CA key path
	caKeyPath := filepath.Join(caPath, "ca-key.pem")

	// Generate the certificate (cert-file.pem) using the CSR, CA cert and key, and the extfile
	certPath := filepath.Join(sslFolderPath, "cert-file.pem")
	err = thirdparty.GenerateCertificate(csrPath, caCertPath, caKeyPath, extfilePath, certPath, password)
	if err != nil {
		return fmt.Errorf("failed to generate certificate: %w", err)
	}

	// Now combine cert-file.pem and ca.pem into cert.pem
	fullchainPath := filepath.Join(sslFolderPath, "cert.pem")
	err = thirdparty.CombineCertsIntoFullchain(certPath, caCertPath, fullchainPath)
	if err != nil {
		return fmt.Errorf("failed to combine cert and CA cert into cert.pem: %w", err)
	}

	return nil
}

// CleanCertificate keeps only the necessary certificate files, renames fullchain.pem to cert.pem,
// and deletes all other generated certificate files, keeping cert.pem, ca.pem, and cert-key.pem.
func (r *RepoManager) CleanCertificate() error {
	// Get the path to the SSL folder
	sslFolderPath := r.GetSSLPath()

	// Define the files to keep
	filesToKeep := []string{
		"ca.pem",       // Public CA certificate (from self-ca folder)
		"cert-key.pem", // Certificate key (without passphrase)
		"cert.pem",     // Renamed certificate
	}

	// Define the path for the CA folder
	caPath := filepath.Join(sslFolderPath, "self-ca")

	// Ensure the self-ca folder exists and has the correct files
	if _, err := os.Stat(caPath); os.IsNotExist(err) {
		return fmt.Errorf("CA folder '%s' does not exist", caPath)
	}

	// Define the file to rename
	oldFullchainPath := filepath.Join(sslFolderPath, "fullchain.pem")
	newCertPath := filepath.Join(sslFolderPath, "cert.pem")

	// Rename fullchain.pem to cert.pem if it exists
	if _, err := os.Stat(oldFullchainPath); err == nil {
		// Rename the file
		err := os.Rename(oldFullchainPath, newCertPath)
		if err != nil {
			return fmt.Errorf("failed to rename fullchain.pem to cert.pem: %w", err)
		}
	}

	// Remove other files that are not in the "filesToKeep" list
	err := filepath.Walk(sslFolderPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Skip directories or files in the "filesToKeep" list
		if info.IsDir() {
			return nil
		}

		// Get the base file name
		fileName := filepath.Base(path)

		// Skip the files we need to keep
		for _, keepFile := range filesToKeep {
			if fileName == keepFile {
				return nil // Skip this file (do not delete)
			}
		}

		// If the file is not one of the ones to keep, delete it
		err = os.Remove(path)
		if err != nil {
			return fmt.Errorf("failed to delete file %s: %w", path, err)
		}

		return nil
	})

	if err != nil {
		return fmt.Errorf("failed to clean up certificate files: %w", err)
	}

	// Clean up the self-ca folder after keeping ca.pem and ca-key.pem (if needed)
	err = filepath.Walk(caPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Skip directories or files we want to keep
		if info.IsDir() {
			return nil
		}

		// Define files in the CA folder to keep
		caFilesToKeep := []string{
			"ca.pem",     // The CA public certificate
			"ca-key.pem", // The CA private key
		}

		// Check if the file is in the list of files to keep
		for _, caFile := range caFilesToKeep {
			if filepath.Base(path) == caFile {
				return nil // Skip this file (do not delete)
			}
		}

		// If not in the list of files to keep, delete it
		err = os.Remove(path)
		if err != nil {
			return fmt.Errorf("failed to delete CA file %s: %w", path, err)
		}

		return nil
	})

	if err != nil {
		return fmt.Errorf("failed to clean up CA files: %w", err)
	}

	return nil
}
