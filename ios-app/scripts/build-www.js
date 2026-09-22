/*
  Copies the web app (one folder up) into ios-app/www, which Capacitor bundles inside the iOS app.
  Run with: npm run build:www   (npm run sync does this for you)
*/
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..');
const out = path.join(__dirname, '..', 'www');

const files = ['index.html', 'styles.css', 'app.js', 'config.js'];
const dirs = ['data', 'fonts', 'audio'];

function fail(msg) { console.error('\nERROR: ' + msg + '\n'); process.exit(1); }

for (const f of files) if (!fs.existsSync(path.join(root, f))) fail('Missing ' + f + ' in ' + root);
for (const d of dirs) if (!fs.existsSync(path.join(root, d))) {
  fail('Missing the "' + d + '" folder in ' + root + (d === 'audio' ? '. Generate the Tamil audio files first (see README.md).' : ''));
}

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const f of files) fs.copyFileSync(path.join(root, f), path.join(out, f));
for (const d of dirs) fs.cpSync(path.join(root, d), path.join(out, d), { recursive: true });

const mp3 = fs.readdirSync(path.join(out, 'audio')).filter((f) => f.endsWith('.mp3')).length;
if (mp3 < 220) console.warn('WARNING: only ' + mp3 + ' audio files found. The full course has about 226.');
console.log('Copied the web app to ios-app/www (' + mp3 + ' audio files).');
