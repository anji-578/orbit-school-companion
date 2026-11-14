#!/usr/bin/env bash
# Copy upload keystore + key.properties to a private backup folder (never commit).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${ORBIT_KEYSTORE_BACKUP_DIR:-$HOME/Orbit-Play-Secrets}"
umask 077
if ! mkdir -p "$DEST" 2>/dev/null; then
  DEST="$ROOT/.play-secrets"
  mkdir -p "$DEST"
  echo "Home backup unavailable — using $DEST (gitignored)."
fi
# Ensure folder is never committed
if [[ "$DEST" == "$ROOT/.play-secrets" ]]; then
  touch "$ROOT/.play-secrets/.gitkeep"
fi

if [[ ! -f "$ROOT/android/upload-keystore.jks" || ! -f "$ROOT/android/key.properties" ]]; then
  echo "Missing android/upload-keystore.jks or android/key.properties"
  echo "Run: npm run android:keystore"
  exit 1
fi

cp -f "$ROOT/android/upload-keystore.jks" "$DEST/upload-keystore.jks"
cp -f "$ROOT/android/key.properties" "$DEST/key.properties"
DATE="$(date -u +%Y%m%dT%H%M%SZ)"
cp -f "$ROOT/android/upload-keystore.jks" "$DEST/upload-keystore-$DATE.jks"
cp -f "$ROOT/android/key.properties" "$DEST/key-$DATE.properties"

cat > "$DEST/README.txt" <<EOF
Orbit Play upload key — private backup
Created: $DATE
App id: app.orbit.student

Losing this keystore blocks Play Store updates.
Keep offline + password manager copies as well.
EOF

echo "Backed up to $DEST"
ls -la "$DEST"
