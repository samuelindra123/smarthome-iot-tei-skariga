# PWA → Native (Android TWA & iOS) guide (Codespaces-ready)

This guide explains how to wrap your existing PWA into an Android APK using Trusted Web Activity (TWA) and options for iOS. The scripts and devcontainer included allow building and testing an APK inside GitHub Codespaces.

Requirements (already satisfied by your repo):
- Your site is a PWA (valid `manifest.json`, service worker, served over HTTPS).
- Android: You control the domain and can add Digital Asset Links (assetlinks.json) to enable TWA.

What this repo provides:
- `.devcontainer/` — Codespaces devcontainer with Java, Node, Android command-line tools, and a `post-create.sh` that installs Bubblewrap.
- `scripts/generate_twa.sh` — helper script to init and build a TWA APK with a default debug keystore.

Android (Trusted Web Activity) — overview
1. Bubblewrap (by Google) wraps your PWA into an Android app that opens in a Chrome-backed full-screen view.
2. You get native assets: splash screen, launcher icon, and can add native UI around the web content by editing the generated Android project.
3. Use Digital Asset Links: add `/.well-known/assetlinks.json` to your domain, and set `applicationId` in the generated Android app. This lets Chrome verify the app and allow full-screen TWA without browser UI.

Steps to build in Codespaces
1. Open the repository in Codespaces (or start a Codespace from the `main` branch). The devcontainer will run `post-create.sh`.
2. From a terminal in Codespaces:

```bash
# install dependencies (post-create normally does this)
bash .devcontainer/post-create.sh

# Initialize and build TWA (example)
scripts/generate_twa.sh https://your-pwa.example.com com.example.smarthome
```

3. The script will create a `twa/` folder, run `bubblewrap init`, create a debug keystore, and run `bubblewrap build` (uses Gradle). The unsigned/signed APKs will be under `twa/app/build/outputs/apk/`.

Custom native UI
- After `bubblewrap init` you'll have an Android project in `twa/`. Open it and:
  - Edit `app/src/main/res/drawable/` for splash screens and icons.
  - Modify `MainActivity` and layout files to add native navigation, buttons, or custom top/bottom bars.
  - Use `webview` or Chrome Custom Tabs if you need more native control than TWA offers.

Notes about server-driven updates
- TWA uses Chrome to render the PWA; content updates are served by your PWA (so web features update automatically).
- If you add native features requiring APK updates (native code or new permissions), you'll need to rebuild and redistribute the APK.

iOS options
- Modern option: Capacitor (Ionic) — wraps PWA in a WebView, allows native plugins and Swift/Objective-C UI. Use EAS (Expo Application Services) or GitHub Actions + macOS runner to build IPA.
- Alternative: WKWebView-based native app using a lightweight native shell and UI.
- Building IPA in Codespaces: Not possible to produce App Store–ready IPA without macOS/macOS-hosted runner for code signing. You can still use Capacitor to generate the Xcode project in Codespaces and then build/sign on a macOS CI or locally.

Signing and Distribution
- Android: sign APK with your release keystore (`keytool` / `apksigner`). For internal testing, the debug keystore may suffice for sideloading.
- iOS: requires Apple Developer account and macOS build environment for signing. Consider using TestFlight or Enterprise distribution.

CI & Codespaces tips
- Store release keys (Android keystore, passwords) as GitHub Secrets and mount them at build time using Codespaces secrets or repository secrets in Actions.
- For continuous builds, use GitHub Actions (Linux runner for Android) and macOS runner for iOS.

Security
- Keep keystore files out of source control. Use secrets management and ephemeral mounts in Codespaces.

Further reading
- Bubblewrap: https://github.com/GoogleChromeLabs/bubblewrap
- Trusted Web Activity docs: https://developer.chrome.com/docs/android/trusted-web-activity/
- Capacitor: https://capacitorjs.com/
