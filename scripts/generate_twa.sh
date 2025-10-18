#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <pwa-url> [package-id]"
  echo "Example: $0 https://example.com app.example.smarthome"
  exit 2
fi

PWA_URL="$1"
PACKAGE_ID="${2:-com.example.smarthome}"
APP_NAME="SmartHome"
KEYSTORE_PATH="twa/keystore.jks"
KEY_ALIAS="twa-key"

mkdir -p twa
cd twa

echo "Initializing TWA project for $PWA_URL (package: $PACKAGE_ID)"
if [ ! -f package.json ]; then
  bubblewrap init --manifest "$PWA_URL/manifest.json" --site "$PWA_URL" --packageId "$PACKAGE_ID" --appName "$APP_NAME"
fi

echo "Updating bubblewrap config (default splash & icons)"
jq '.manifestUrl = "'"$PWA_URL"'" bubblewrap.json > bubblewrap.json.tmp || true
mv bubblewrap.json.tmp bubblewrap.json || true

if [ ! -f "$KEYSTORE_PATH" ]; then
  echo "Generating debug keystore at $KEYSTORE_PATH"
  keytool -genkeypair -v -keystore "$KEYSTORE_PATH" -storepass android -alias "$KEY_ALIAS" -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=SmartHome, OU=Dev, O=Example, L=City, ST=State, C=US"
fi

echo "Building TWA (Gradle)"
bubblewrap build --keystore "$KEYSTORE_PATH" --keystorePassword android --keyPassword android --keyAlias "$KEY_ALIAS"

echo "APK built in twa/app/build/outputs/apk/release/ (or app-debug for debug builds)."
echo "To sign with your own release key, replace the keystore and passwords above."
