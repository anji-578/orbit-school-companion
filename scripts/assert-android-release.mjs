#!/usr/bin/env node
/**
 * Fail if Android release hardening is missing or regresses.
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const manifestPath = resolve(root, 'android/app/src/main/AndroidManifest.xml')
const gradlePath = resolve(root, 'android/app/build.gradle')
const networkPath = resolve(root, 'android/app/src/main/res/xml/network_security_config.xml')
const backupPath = resolve(root, 'android/app/src/main/res/xml/backup_rules.xml')
const dataExtractPath = resolve(root, 'android/app/src/main/res/xml/data_extraction_rules.xml')
const privacyPath = resolve(root, 'public/legal/privacy.html')
const termsPath = resolve(root, 'public/legal/terms.html')
const deletePath = resolve(root, 'public/legal/delete-account.html')

function mustExist(path, label) {
  if (!existsSync(path)) {
    console.error(`[android-release] missing ${label}: ${path}`)
    process.exit(1)
  }
}

mustExist(manifestPath, 'AndroidManifest')
mustExist(gradlePath, 'app/build.gradle')
mustExist(networkPath, 'network_security_config.xml')
mustExist(backupPath, 'backup_rules.xml')
mustExist(dataExtractPath, 'data_extraction_rules.xml')
mustExist(privacyPath, 'privacy.html')
mustExist(termsPath, 'terms.html')
mustExist(deletePath, 'delete-account.html')

const manifest = readFileSync(manifestPath, 'utf8')
if (/usesCleartextTraffic\s*=\s*"true"/.test(manifest)) {
  console.error('[android-release] FAIL: usesCleartextTraffic must be false')
  process.exit(1)
}
if (/android:allowBackup\s*=\s*"true"/.test(manifest)) {
  console.error('[android-release] FAIL: allowBackup must be false')
  process.exit(1)
}
if (!/networkSecurityConfig\s*=\s*"@xml\/network_security_config"/.test(manifest)) {
  console.error('[android-release] FAIL: networkSecurityConfig missing')
  process.exit(1)
}

const network = readFileSync(networkPath, 'utf8')
if (!/cleartextTrafficPermitted\s*=\s*"false"/.test(network)) {
  console.error('[android-release] FAIL: network security must deny cleartext')
  process.exit(1)
}

const gradle = readFileSync(gradlePath, 'utf8')
if (!/minifyEnabled\s+true/.test(gradle)) {
  console.error('[android-release] FAIL: release minifyEnabled must be true')
  process.exit(1)
}
if (!/signingConfigs/.test(gradle) || !/key\.properties/.test(gradle)) {
  console.error('[android-release] FAIL: release signing via key.properties required')
  process.exit(1)
}
if (!/versionName\s+"1\./.test(gradle)) {
  console.error('[android-release] FAIL: versionName should be 1.x for store listing')
  process.exit(1)
}

console.log('[android-release] OK — cleartext off, backup off, minify on, legal pages present')
