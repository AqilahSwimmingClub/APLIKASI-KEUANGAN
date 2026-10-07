#!/usr/bin/env bash
# Source this in the prepared Codex cloud snapshot before Android commands.
export npm_config_cache=/workspace/.npm-cache
export ANDROID_HOME=/workspace/android-sdk
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export ANDROID_USER_HOME=/workspace/android-user
export GRADLE_USER_HOME=/workspace/.gradle
export JAVA_HOME=/workspace/jdk-21
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"
if [ -r /etc/ssl/certs/java/cacerts ]; then
  export JAVA_TOOL_OPTIONS="${JAVA_TOOL_OPTIONS:+$JAVA_TOOL_OPTIONS }-Djavax.net.ssl.trustStore=/etc/ssl/certs/java/cacerts"
fi
if [ -x /usr/bin/chromium ]; then
  export PLAYWRIGHT_EXECUTABLE_PATH=/usr/bin/chromium
else
  export PLAYWRIGHT_BROWSERS_PATH=/workspace/.playwright
fi
