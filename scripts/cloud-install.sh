#!/usr/bin/env bash
set -euo pipefail
cd /workspace/APLIKASI-KEUANGAN
source scripts/cloud-env.sh
mkdir -p "$ANDROID_USER_HOME/cache" "$GRADLE_USER_HOME"
if [ ! -x "$JAVA_HOME/bin/javac" ]; then
  curl -fsSL --retry 2 https://download.oracle.com/java/21/latest/jdk-21_linux-x64_bin.tar.gz -o /tmp/krt-jdk.tar.gz
  curl -fsSL --retry 2 https://download.oracle.com/java/21/latest/jdk-21_linux-x64_bin.tar.gz.sha256 -o /tmp/krt-jdk.sha256
  python3 - <<'PY'
import hashlib
expected=open('/tmp/krt-jdk.sha256').read().split()[0]
assert hashlib.sha256(open('/tmp/krt-jdk.tar.gz','rb').read()).hexdigest()==expected, 'JDK checksum mismatch'
PY
  mkdir -p "$JAVA_HOME"
  tar -xzf /tmp/krt-jdk.tar.gz -C "$JAVA_HOME" --strip-components=1
fi
if [ ! -x "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" ]; then
  curl -fsSL --retry 2 https://dl.google.com/android/repository/commandlinetools-linux-13114758_latest.zip -o /tmp/krt-sdk.zip
  printf '%s  %s\n' 5fdcc763663eefb86a5b8879697aa6088b041e70 /tmp/krt-sdk.zip | sha1sum -c -
  mkdir -p "$ANDROID_HOME/cmdline-tools"
  unzip -q /tmp/krt-sdk.zip -d "$ANDROID_HOME/cmdline-tools"
  mv "$ANDROID_HOME/cmdline-tools/cmdline-tools" "$ANDROID_HOME/cmdline-tools/latest"
fi
# Only proxy host/port are used, never credentials. This file stays outside Git.
python3 - <<'PY'
import os,urllib.parse,pathlib
p=urllib.parse.urlsplit(os.environ.get('HTTPS_PROXY',os.environ.get('https_proxy','')))
if p.hostname:
 path=pathlib.Path(os.environ['GRADLE_USER_HOME'])/'gradle.properties'
 existing=path.read_text() if path.exists() else ''
 lines=[line for line in existing.splitlines() if not line.startswith(('systemProp.http.proxy','systemProp.https.proxy'))]
 lines += [f'systemProp.{scheme}.proxy{key}={value}' for scheme in ['http','https'] for key,value in [('Host',p.hostname),('Port',p.port or 80)]]
 path.write_text('\n'.join(lines)+'\n')
PY
if [ ! -f "$ANDROID_HOME/platforms/android-36/android.jar" ] || [ ! -x "$ANDROID_HOME/build-tools/36.0.0/aapt2" ]; then
  python3 - <<'PY'
import os,urllib.parse,subprocess
p=urllib.parse.urlsplit(os.environ.get('HTTPS_PROXY',os.environ.get('https_proxy','')))
args=[os.environ['ANDROID_HOME']+'/cmdline-tools/latest/bin/sdkmanager']
if p.hostname:args += ['--proxy=http','--proxy_host='+p.hostname,'--proxy_port='+str(p.port or 80)]
subprocess.run(args+['--licenses'],input='y\n'*100,text=True,check=True)
subprocess.run(args+['platform-tools','platforms;android-36','build-tools;36.0.0'],check=True)
PY
fi
javac -version
npm ci --no-audit --no-fund
if [ -z "${PLAYWRIGHT_EXECUTABLE_PATH:-}" ]; then
  npx playwright install chromium
fi
npm run lint
npm run typecheck
npm test
npm run android:sync
npx cap sync ios
(cd android && ./gradlew --no-daemon --max-workers=2 -Dorg.gradle.java.installations.paths="$JAVA_HOME" assembleDebug)
