# Tamil Shikho for iOS

This folder wraps the web app (one folder up) in a real iOS app using Capacitor.
The lessons, fonts and audio are bundled inside the app, so it works offline.

## What you need on the Mac
- Xcode 26 or newer, opened once so it finishes installing its components
- Node.js 22 or newer (`node -v` to check)
- An Apple Developer Program membership to run on a real iPhone for more than a short time, and for TestFlight and the App Store

## First-time setup
```
git clone https://github.com/singh318683/tamil-shikho
cd tamil-shikho/ios-app
npm install
npm run add:ios
npm run open
```
`npm run add:ios` copies the web app into `www`, creates the iOS project, adds the microphone permission text, lets audio play with the ringer switch off, and generates the app icon and launch screen. Look at its output for lines starting with "WARNING". If you see one, follow what it says — most likely it means the `audio` folder is missing or incomplete (see the top-level README.md).

## Run it on your iPhone
1. In Xcode, click the blue App project, then the App target, then Signing & Capabilities.
2. Tick "Automatically manage signing" and choose your Team. The bundle identifier is `com.ikshana.tamilshikho`.
3. Plug in your iPhone, choose it at the top of Xcode, and press Run.
4. First time only: on the phone, open Settings > General > VPN & Device Management and trust your developer profile.

## Check these on the phone
- Listen and Slow play, including when the ringer switch is off
- Lesson audio starts by itself when a card appears
- Record asks for microphone permission once, then Stop, Play mine and Compare work
- Nothing is hidden behind the notch or the home bar
- Airplane mode: the app still works

## After you change the web app
```
git pull
cd ios-app
npm run sync
```
Then press Run in Xcode again.

## Send it to testers with TestFlight
1. In App Store Connect, create a new app with the bundle identifier `com.ikshana.tamilshikho`. If "Tamil Shikho" is already taken as the app name, use "Learn Tamil: Shikho" instead, matching the naming used for the Gujarati, Punjabi and Telugu apps.
2. In Xcode choose "Any iOS Device (arm64)" as the target, then Product > Archive.
3. In the Organizer window choose Distribute App > App Store Connect > Upload.
4. In App Store Connect open the TestFlight tab, add testers, and wait for the build to finish processing.

## Before the public App Store release
- In `config.js` set `showTestingTools: false`, then run `npm run sync`
- Have a native speaker review every lesson and listen to all the audio
- Replace `[add your contact email here]` in `privacy.html`, push it, and use `https://tamil-shikho.vercel.app/privacy.html` as the Privacy Policy URL in App Store Connect
- Prepare screenshots, a description, and the App Privacy answers in App Store Connect (the app collects no data)
- Apple can reject apps that feel like a website in a wrapper. The bundled content and offline audio help. Adding a native feature, such as a daily practice reminder, helps more
