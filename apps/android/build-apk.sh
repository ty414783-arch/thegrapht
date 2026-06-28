#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
SDK="/var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/1017/fs/opt/android-sdk-linux"
PLATFORM="$SDK/platforms/android-35/android.jar"
AAPT="$SDK/build-tools/35.0.0/aapt"
D8="/var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/1017/fs/opt/android-sdk-linux/build-tools/35.0.0/d8"
ZIPALIGN="$SDK/build-tools/35.0.0/zipalign"
APKSIGNER="$SDK/build-tools/35.0.0/apksigner"
KOTLINC="/usr/bin/kotlinc"
KOTLIN_STDLIB="/usr/share/java/kotlin-stdlib.jar"
KOTLIN_STDLIB_JDK7="/usr/share/java/kotlin-stdlib-jdk7.jar"
KOTLIN_STDLIB_JDK8="/usr/share/java/kotlin-stdlib-jdk8.jar"
KEYSTORE="$ROOT/build/debug.keystore"
UNSIGNED_APK="$ROOT/build/thegrapht-unsigned.apk"
ALIGNED_APK="$ROOT/build/thegrapht-aligned.apk"
SIGNED_APK="$ROOT/build/TheGrapht-native-debug.apk"

rm -rf "$ROOT/build/gen" "$ROOT/build/obj" "$ROOT/build/bin"
mkdir -p "$ROOT/build/gen" "$ROOT/build/obj" "$ROOT/build/bin"

$AAPT package -f -m \
  -J "$ROOT/build/gen" \
  -M "$ROOT/AndroidManifest.xml" \
  -S "$ROOT/res" \
  -I "$PLATFORM"

javac \
  -source 1.8 \
  -target 1.8 \
  -encoding UTF-8 \
  -bootclasspath "$PLATFORM" \
  -classpath "$PLATFORM:$ROOT/build/obj" \
  -d "$ROOT/build/obj" \
  $(find "$ROOT/build/gen" -name '*.java' | sort)

$KOTLINC \
  -jvm-target 1.8 \
  -classpath "$PLATFORM:$ROOT/build/obj" \
  -d "$ROOT/build/obj" \
  $(find "$ROOT/src-kotlin" -name '*.kt' | sort)

$D8 --output "$ROOT/build" \
  --lib "$PLATFORM" \
  $(find "$ROOT/build/obj" -name '*.class' | sort) \
  "$KOTLIN_STDLIB" \
  "$KOTLIN_STDLIB_JDK7" \
  "$KOTLIN_STDLIB_JDK8"

$AAPT package -f \
  -M "$ROOT/AndroidManifest.xml" \
  -S "$ROOT/res" \
  -I "$PLATFORM" \
  -F "$UNSIGNED_APK" \
  "$ROOT/build/bin"

( cd "$ROOT/build" && "$AAPT" add "$UNSIGNED_APK" classes.dex )

$ZIPALIGN -f 4 "$UNSIGNED_APK" "$ALIGNED_APK"

if [ ! -f "$KEYSTORE" ]; then
  keytool -genkeypair \
    -keystore "$KEYSTORE" \
    -storepass android \
    -keypass android \
    -alias androiddebugkey \
    -dname "CN=Android Debug,O=Android,C=US" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000
fi

$APKSIGNER sign \
  --ks "$KEYSTORE" \
  --ks-pass pass:android \
  --key-pass pass:android \
  --out "$SIGNED_APK" \
  "$ALIGNED_APK"

echo "Signing complete: $SIGNED_APK"

# Copy output to the served downloads folder
mkdir -p "/root/thegrapht/res/downloads"
cp -f "$SIGNED_APK" "/root/thegrapht/res/downloads/thegrapht-android-alpha.apk"
cp -f "$SIGNED_APK" "/root/thegrapht/res/downloads/thegrapht-android-alpha-0.1.2.apk"
echo "APK successfully served under web-client downloads URL."
