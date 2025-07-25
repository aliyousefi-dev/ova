@echo on

:: Set the directory where the certificate files will be saved
set EXE_DIR=F:\ova\scripts

:: Set the paths for the certificate and key files
set CERT_DIR=%EXE_DIR%\ssl
set CERT_KEY=%CERT_DIR%\root.key
set CERT_PEM=%CERT_DIR%\root.pem
set CERT_DER=%CERT_DIR%\root.der
set CERT_PFX=%CERT_DIR%\root.pfx
set CERT_CN=MyRootCA

:: Create the ssl directory if it doesn't exist
if not exist "%CERT_DIR%" (
    mkdir "%CERT_DIR%"
)

:: Generate the Root Key (Private Key) for the CA
openssl genpkey -algorithm RSA -out "%CERT_KEY%" -aes256 -pass pass:rootpass

:: Generate the Root Certificate
openssl req -x509 -new -key "%CERT_KEY%" -out "%CERT_PEM%" -days 3650 -config req.cnf -sha256 -passin pass:rootpass

:: Convert PEM format to DER format for Android
openssl x509 -outform der -in "%CERT_PEM%" -out "%CERT_DER%"

:: Create a PFX file (PKCS#12 format) for Windows/MacOS or mobile
openssl pkcs12 -export -out "%CERT_PFX%" -inkey "%CERT_KEY%" -in "%CERT_PEM%" -passin pass:rootpass -passout pass:ova

:: Provide instructions for installation
echo Root CA Certificate generated and ready for installation:
echo - Root Certificate in PEM format: %CERT_PEM%
echo - Root Certificate in DER format (for Android): %CERT_DER%
echo - Root Certificate in PFX format (password 'ova'): %CERT_PFX%
echo.
echo For **Android** installation:
echo - Transfer the %CERT_DER% or %CERT_PEM% file to your Android device.
echo - Open **Settings** > **Security** > **Install from storage**.
echo - Locate the file and install it as a **CA certificate** (it will be trusted).
echo.
echo For **iOS** installation:
echo - Email the %CERT_PEM% or %CERT_DER% file to yourself, open the email, and install the certificate as a **CA certificate**.
echo.
echo For **Windows/MacOS** installation:
echo - Install the PFX file (%CERT_PFX%) and use password 'ova' during installation.
echo - After installation, the certificate will be trusted for HTTPS traffic.
echo.
pause
