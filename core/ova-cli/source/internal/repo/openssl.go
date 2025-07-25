package repo

import (
	"fmt"
	"os"
	"ova-cli/source/internal/thirdparty"
	"path/filepath"
)

// GenerateSelfCertificate generates an RSA key using OpenSSL with AES256 encryption
// and saves it to the SSL folder inside the repository, with the file name "ca-key.pem".
// Then it generates a public CA certificate (ca.pem) using the ca-key.pem.
// After that, it generates a certificate key (cert-key.pem) without a passphrase, creates a CSR (cert.csr),
// and finally, it generates the certificate (cert.pem) from the CSR using the CA's key and certificate.
// Finally, it creates a fullchain.pem by combining cert.pem and ca.pem.
func (r *RepoManager) GenerateSelfCertificate(password, dns, ip string) error {
	// Get the path to the SSL folder
	sslFolderPath := r.GetSSLPath()

	// Check if the SSL folder exists, and create it if it doesn't
	if _, err := os.Stat(sslFolderPath); os.IsNotExist(err) {
		// Create the directory if it does not exist
		err := os.MkdirAll(sslFolderPath, os.ModePerm)
		if err != nil {
			return fmt.Errorf("failed to create SSL folder: %w", err)
		}
	}

	// Generate the RSA key (ca-key.pem) with the provided password
	caKeyPath := filepath.Join(sslFolderPath, "ca-key.pem")
	err := thirdparty.GenerateRSAKey(caKeyPath, 4096, password)
	if err != nil {
		return fmt.Errorf("failed to generate RSA key: %w", err)
	}

	// Now generate the public CA certificate (ca.pem) using the private key (ca-key.pem)
	caCertPath := filepath.Join(sslFolderPath, "ca.pem")
	err = thirdparty.GenerateCACert(caKeyPath, caCertPath, password)
	if err != nil {
		return fmt.Errorf("failed to generate CA certificate: %w", err)
	}

	// Generate the certificate key (cert-key.pem) without passphrase
	certKeyPath := filepath.Join(sslFolderPath, "cert-key.pem")
	err = thirdparty.GenerateRSAKeyNoPass(certKeyPath, 4096)
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

	// Generate the certificate (cert.pem) using the CSR, CA cert and key, and the extfile
	certPath := filepath.Join(sslFolderPath, "cert.pem")
	err = thirdparty.GenerateCertificate(csrPath, caCertPath, caKeyPath, extfilePath, certPath, password)
	if err != nil {
		return fmt.Errorf("failed to generate certificate: %w", err)
	}

	// Now combine cert.pem and ca.pem into fullchain.pem
	fullchainPath := filepath.Join(sslFolderPath, "fullchain.pem")
	err = thirdparty.CombineCertsIntoFullchain(certPath, caCertPath, fullchainPath)
	if err != nil {
		return fmt.Errorf("failed to combine cert and CA cert into fullchain.pem: %w", err)
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
		"ca.pem",        // Public CA certificate
		"cert-key.pem",  // Certificate key (without passphrase)
		"cert.pem",      // Renamed certificate
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

		// Check if the file is not one of the ones to keep
		for _, file := range filesToKeep {
			if filepath.Base(path) == file {
				return nil // Skip this file (do not delete)
			}
		}

		// Delete the file if it's not in the "filesToKeep" list
		if !info.IsDir() {
			err := os.Remove(path)
			if err != nil {
				return fmt.Errorf("failed to delete file %s: %w", path, err)
			}
		}

		return nil
	})

	if err != nil {
		return fmt.Errorf("failed to clean up certificate files: %w", err)
	}

	return nil
}
