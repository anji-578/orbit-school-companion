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

# Prefer Temurin 21 from repo toolchain (Capacitor 8 requires Java 21).
if [[ -x "$ROOT/.android-toolchain/jdk-21/Contents/Home/bin/java" ]]; then
  export JAVA_HOME="$ROOT/.android-toolchain/jdk-21/Contents/Home"
elif [[ -x "$ROOT/.android-toolchain/jdk-17.0.16+8/Contents/Home/bin/java" ]]; then
  export JAVA_HOME="$ROOT/.android-toolchain/jdk-17.0.16+8/Contents/Home"
  echo "WARN: JDK 21 not found; Capacitor release may fail with 'invalid source release: 21'"
fi
export PATH="${JAVA_HOME:+$JAVA_HOME/bin:}$PATH"

if [[ -f android/local.properties ]]; then
  # shellcheck disable=SC1091
  SDK_DIR="$(sed -n 's/^sdk.dir=//p' android/local.properties | tr -d '\r')"
  if [[ -n "$SDK_DIR" ]]; then
    export ANDROID_HOME="$SDK_DIR"
    export ANDROID_SDK_ROOT="$SDK_DIR"
  fi
elif [[ -d "$ROOT/.android-toolchain/sdk" ]]; then
  export ANDROID_HOME="$ROOT/.android-toolchain/sdk"
  export ANDROID_SDK_ROOT="$ANDROID_HOME"
fi

npm run build
npx cap sync android

GRADLE_BIN="android/gradlew"
if [[ -x "$ROOT/.android-toolchain/gradle-8.14.3/bin/gradle" ]]; then
  GRADLE_BIN="$ROOT/.android-toolchain/gradle-8.14.3/bin/gradle"
fi

cd android
if [[ "$GRADLE_BIN" == *"gradle-8.14.3"* ]]; then
  "$GRADLE_BIN" bundleRelease --no-daemon
else
  ./gradlew bundleRelease --no-daemon
fi

AAB="app/build/outputs/bundle/release/app-release.aab"
if [[ -f "$AAB" ]]; then
  mkdir -p "$ROOT/.play-secrets"
  cp -f "$AAB" "$ROOT/.play-secrets/app-release.aab"
  echo "AAB ready: android/$AAB"
  echo "Copy: $ROOT/.play-secrets/app-release.aab"
else
  echo "Gradle finished but AAB not found at $AAB"
  exit 1
fi
