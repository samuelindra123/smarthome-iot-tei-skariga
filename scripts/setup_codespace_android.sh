#!/usr/bin/env bash
set -euo pipefail

echo "Running Codespace Android setup..."
bash .devcontainer/post-create.sh
echo "Setup complete. You can now run scripts/generate_twa.sh <pwa-url> [package-id]"
