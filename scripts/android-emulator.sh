#!/usr/bin/env bash
# Run this in macOS Terminal / iTerm (NOT inside Cursor's agent sandbox).
# The Android emulator needs unrestricted CPU features (NEON/CRC32) and GUI launch rights.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TOOL="$ROOT/.android-toolchain"
SDK="$TOOL/sdk"

if [ ! -x "$SDK/emulator/emulator" ]; then
  echo "Missing local SDK at $SDK"
  echo "Ask Cursor to re-run the Android toolchain setup, or install Android Studio."
  exit 1
fi

export JAVA_HOME="$TOOL/jdk"
export ANDROID_HOME="$SDK"
export ANDROID_SDK_ROOT="$SDK"
export ANDROID_USER_HOME="$TOOL/android-user"
export ANDROID_AVD_HOME="$TOOL/avd"
export PATH="$JAVA_HOME/bin:$SDK/platform-tools:$SDK/emulator:$PATH"
mkdir -p "$ANDROID_USER_HOME"

echo "==> Starting AVD Orbit_API_35"
"$SDK/emulator/emulator" -avd Orbit_API_35 -netdelay none -netspeed full -gpu auto >/tmp/orbit-emulator.log 2>&1 &
EMU_PID=$!
echo "Emulator PID $EMU_PID (log: /tmp/orbit-emulator.log)"

echo "==> Waiting for device..."
adb wait-for-device
until [[ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" == "1" ]]; do
  sleep 2
done
echo "==> Emulator booted"

echo "==> Ensure Vite is running on :5173 (Capacitor live-reloads from http://10.0.2.2:5173)"
if ! curl -fsS "http://127.0.0.1:5173" >/dev/null; then
  echo "Start the web server in another terminal:"
  echo "  cd $ROOT && npm run dev -- --host 127.0.0.1 --port 5173"
  exit 1
fi

echo "==> Building / syncing Capacitor Android app"
cd "$ROOT"
npm run cap:sync
npx cap run android --target "$(adb devices | awk '/emulator-/{print $1; exit}')"

echo "Done. Login as student040@demo50.orbit.app / Demo50!"
