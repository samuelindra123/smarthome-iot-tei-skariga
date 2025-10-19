#!/usr/bin/env bash
set -euo pipefail

echo "Running post-create setup for Android TWA Codespace..."

# Update and install dependencies
sudo apt-get update -y
sudo apt-get install -y wget unzip openjdk-11-jdk gradle git

echo "Installing Android command-line tools"
ANDROID_SDK_ROOT="$HOME/Android/Sdk"
mkdir -p "$ANDROID_SDK_ROOT/cmdline-tools"
cd /tmp
CMDLINE_ZIP="commandlinetools-linux-9477386_latest.zip"
if [ ! -f "$CMDLINE_ZIP" ]; then
  wget -q https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip -O "$CMDLINE_ZIP"
fi
unzip -q -o "$CMDLINE_ZIP" -d "$ANDROID_SDK_ROOT/cmdline-tools"
mv "$ANDROID_SDK_ROOT/cmdline-tools/cmdline-tools" "$ANDROID_SDK_ROOT/cmdline-tools/latest" || true

export PATH="$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$PATH"
export PATH="$ANDROID_SDK_ROOT/platform-tools:$PATH"

yes | "$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" --sdk_root="$ANDROID_SDK_ROOT" "platform-tools" "platforms;android-33" "build-tools;33.0.2" "cmdline-tools;latest" >/dev/null

echo "Installing bubblewrap (TWA)"
npm install -g @bubblewrap/cli@latest

echo "Post-create completed. You may need to restart the Codespace to pick up environment changes."
