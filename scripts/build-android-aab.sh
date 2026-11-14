#!/usr/bin/env bash
# Production AAB: web build → Capacitor sync → signed bundle (needs key.properties).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

node scripts/check-capacitor-release.mjs
node scripts/assert-android-release.mjs

if [[ ! -f android/key.properties ]]; then
  echo "Missing android/key.properties. Run: bash scripts/generate-upload-keystore.sh"
  exit 1
fi

npm run build
npx cap sync android
cd android
./gradlew bundleRelease
AAB="app/build/outputs/bundle/release/app-release.aab"
if [[ -f "$AAB" ]]; then
  echo "AAB ready: android/$AAB"
else
  echo "Gradle finished but AAB not found at $AAB"
  exit 1
fi
