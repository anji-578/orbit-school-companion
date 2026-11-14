#!/usr/bin/env bash
# Generate a Play upload keystore locally (never commit the output).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_JKS="$ROOT/android/upload-keystore.jks"
OUT_PROPS="$ROOT/android/key.properties"

if [[ -f "$OUT_JKS" ]]; then
  echo "Already exists: $OUT_JKS — refusing to overwrite."
  exit 1
fi

# Prefer repo Android toolchain JDK when system Java is missing.
if [[ -x "$ROOT/.android-toolchain/jdk-17.0.16+8/Contents/Home/bin/keytool" ]]; then
  export JAVA_HOME="$ROOT/.android-toolchain/jdk-17.0.16+8/Contents/Home"
  KEYTOOL="$JAVA_HOME/bin/keytool"
elif command -v keytool >/dev/null 2>&1; then
  KEYTOOL="keytool"
else
  echo "keytool not found. Install a JDK or use .android-toolchain."
  exit 1
fi

STORE_PASS="${ORBIT_KEYSTORE_PASSWORD:-}"
if [[ -z "$STORE_PASS" ]]; then
  STORE_PASS="$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)"
fi

"$KEYTOOL" -genkeypair \
  -alias orbit \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -keystore "$OUT_JKS" \
  -storepass "$STORE_PASS" \
  -keypass "$STORE_PASS" \
  -dname "CN=Orbit Student, OU=Orbit, O=Orbit, L=Hyderabad, ST=Telangana, C=IN"

cat > "$OUT_PROPS" <<EOF
storePassword=$STORE_PASS
keyPassword=$STORE_PASS
keyAlias=orbit
storeFile=upload-keystore.jks
EOF

echo "Created $OUT_JKS and $OUT_PROPS"
echo "Back up the keystore and passwords offline. Losing them blocks Play updates."
echo "Passwords are in key.properties (gitignored) — copy to a password manager now."
