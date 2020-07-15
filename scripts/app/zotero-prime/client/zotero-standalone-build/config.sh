DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Version of Gecko to build with
GECKO_VERSION_MAC="52.9.0esr"
GECKO_VERSION_LINUX="52.9.0esr"
GECKO_VERSION_WIN="52.9.0esr"

# Paths to Gecko runtimes
MAC_RUNTIME_PATH="$DIR/xulrunner/Firefox.app"
WIN32_RUNTIME_PATH="$DIR/xulrunner/firefox-win32"
LINUX_i686_RUNTIME_PATH="$DIR/xulrunner/firefox-i686"
LINUX_x86_64_RUNTIME_PATH="$DIR/xulrunner/firefox-x86_64"

PDF_TOOLS_VERSION="0.0.3"
PDF_TOOLS_URL="https://zotero-download.s3.amazonaws.com/pdftools/pdftools-$PDF_TOOLS_VERSION.tar.gz"

# Whether to sign builds
SIGN=0

# OS X Developer ID certificate information
DEVELOPER_ID=F0F1FE48DB909B263AC51C8215374D87FDC12121
# Keychain and keychain password, if not building via the GUI
KEYCHAIN=""
KEYCHAIN_PASSWORD=""

# Paths for Windows installer build
NSIS_DIR='C:\Program Files (x86)\NSIS\Unicode\'

# Paths for Windows installer build only necessary for signed binaries
#SIGNTOOL='C:\Program Files (x86)\Microsoft SDKs\Windows\v7.0A\Bin\signtool.exe'
SIGNTOOL='C:\Program Files (x86)\Windows Kits\8.0\bin\x86\signtool.exe'
SIGNATURE_URL='https://www.zotero.org/'
SIGNTOOL_CERT_SUBJECT="Corporation for Digital Scholarship"

# Directory for Zotero code repos
repo_dir=$( cd "$DIR"/.. && pwd )
# Directory for Zotero source code
ZOTERO_SOURCE_DIR="$repo_dir"/zotero-client
# Directory for Zotero build files (needed for scripts/*_build_and_deploy)
ZOTERO_BUILD_DIR="$repo_dir"/zotero-build
# Directory for unpacked binaries
STAGE_DIR="$DIR/staging"
# Directory for packed binaries
DIST_DIR="$DIR/dist"

SOURCE_REPO_URL="https://github.com/zotero/zotero"
S3_BUCKET="zotero-download"
S3_CI_ZIP_PATH="ci/client"
S3_DIST_PATH="client"

DEPLOY_HOST="deploy.zotero"
DEPLOY_PATH="www/www-production/public/download/client/manifests"
DEPLOY_CMD="ssh $DEPLOY_HOST update-site-files"

BUILD_PLATFORMS=""
NUM_INCREMENTALS=6

if [ -f "$DIR/config-custom.sh" ]; then
	. "$DIR/config-custom.sh"
fi

unset DIR
