/*
  Makes the two small native changes the app needs, right after "npx cap add ios":
    1. Info.plist: the microphone permission text (iOS refuses to record without it) and the
       "no special encryption" declaration (skips a question on every App Store upload).
    2. AppDelegate.swift: lets lesson audio play even when the phone's ringer switch is off.
  Safe to run more than once. If it cannot patch a file it tells you what to add by hand.
*/
const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, '..', 'ios', 'App', 'App');
const plistPath = path.join(appDir, 'Info.plist');
const delegatePath = path.join(appDir, 'AppDelegate.swift');

const MIC_TEXT = 'Tamil Shikho uses the microphone so you can record yourself saying phrases and compare them with the model voice. Recordings stay on your device.';

function patchPlist() {
  if (!fs.existsSync(plistPath)) { console.warn('Could not find ' + plistPath + '. Add NSMicrophoneUsageDescription in Xcode (Info tab): "' + MIC_TEXT + '"'); return; }
  let s = fs.readFileSync(plistPath, 'utf8');
  let add = '';
  if (!s.includes('NSMicrophoneUsageDescription')) add += '\t<key>NSMicrophoneUsageDescription</key>\n\t<string>' + MIC_TEXT + '</string>\n';
  if (!s.includes('ITSAppUsesNonExemptEncryption')) add += '\t<key>ITSAppUsesNonExemptEncryption</key>\n\t<false/>\n';
  if (!add) { console.log('Info.plist already patched.'); return; }
  const i = s.lastIndexOf('</dict>');
  if (i < 0) { console.warn('Unexpected Info.plist format. Add NSMicrophoneUsageDescription in Xcode (Info tab): "' + MIC_TEXT + '"'); return; }
  fs.writeFileSync(plistPath, s.slice(0, i) + add + s.slice(i));
  console.log('Info.plist patched (microphone text' + (add.includes('ITSApp') ? ' and encryption declaration' : '') + ').');
}

const SNIPPET =
  '\n        // Tamil Shikho: play lesson audio even when the ringer switch is off.\n' +
  '        do {\n' +
  '            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)\n' +
  '        } catch {\n' +
  '            print("Audio session setup failed: \\(error)")\n' +
  '        }\n';

function patchDelegate() {
  if (!fs.existsSync(delegatePath)) { manual('Could not find AppDelegate.swift.'); return; }
  let s = fs.readFileSync(delegatePath, 'utf8');
  if (s.includes('AVAudioSession')) { console.log('AppDelegate.swift already patched.'); return; }
  const re = /func application\(\s*_ application: UIApplication,\s*didFinishLaunchingWithOptions[^{]*\{/;
  const m = re.exec(s);
  if (!m) { manual('Could not find didFinishLaunchingWithOptions in AppDelegate.swift.'); return; }
  s = s.slice(0, m.index + m[0].length) + SNIPPET + s.slice(m.index + m[0].length);
  if (!/import\s+AVFoundation/.test(s)) s = s.replace(/import UIKit\n/, 'import UIKit\nimport AVFoundation\n');
  fs.writeFileSync(delegatePath, s);
  console.log('AppDelegate.swift patched (audio plays with the ringer switch off).');
}
function manual(why) {
  console.warn(why + '\nOptional by-hand step: in AppDelegate.swift add "import AVFoundation" at the top and, at the start of\n' +
    'application(_:didFinishLaunchingWithOptions:), add:\n' + SNIPPET);
}

patchPlist();
patchDelegate();
