# Tamil Shikho (web prototype, version 2)

A static web app for testing a speaking-first Tamil course before building the Android/iOS app.
It teaches listening, understanding and speaking. Learners do not need to read Tamil script.
No build step and no dependencies. Progress is saved in each tester's own browser.

## What is in it
- 25 lessons in four levels: First conversations, Family, Daily life, Festivals and fun
- Each lesson: learn cards (hear it, see it spelled the English way, see the meaning), then practice
- Practice types: listen and pick the meaning, pick how to say something, listen and pick the reply (small conversations), and "Now you say it"
- Normal and Slow audio buttons for every phrase
- Speaking practice: record yourself, play it back, or compare with the model voice. Nothing is scored automatically; learners judge for themselves
- Checkpoint reviews, streak and XP, sequential unlocking
- A "Content review" screen for a native speaker (Testing tools > Open the content review list)
- Tamil script is hidden by default. Turn it on in Testing tools > Show Tamil script

## Audio
The app plays files from the `audio` folder. Each phrase has two files named from its "said as" text, for example `vanakkam.mp3` and `vanakkam-slow.mp3`.
1. Generate the audio for every phrase (`python make_audio.py`, using the same edge-tts approach as the Gujarati, Punjabi and Telugu apps, or real recordings from a native speaker). This should create an `audio` folder.
2. Put that folder next to `index.html`.
3. Keep `useRecordedAudio: true` in `config.js`.

To replace a file with a real human recording, save it under the same file name.

**Note:** this prototype ships with no `audio` folder yet — Listen/Slow will silently fail (or fall back to the phone's built-in voice, which most iPhones lack for Tamil) until it's added.

## Put it on GitHub and Vercel
Upload everything to a GitHub repository, then import that repository in Vercel with Framework Preset "Other" and no build command. Every push redeploys automatically.

## iOS app
The `ios-app` folder wraps this web app as a real iPhone app. See `ios-app/README-ios.md`.

## Change the lessons
All content is in `data/tamil.js`. Each phrase is one line. If you change a phrase's "said as" text, its audio file name changes too, so audio needs to be regenerated for that line.
`data/items.json` is the flat word list `make_audio.py` reads — regenerate it if you add or remove lessons (it should always match `data/tamil.js`).

## A note on the content
This first pass of lessons was drafted, not sourced from a native speaker. Spoken Tamil varies a fair bit by region (this leans toward a general/Chennai-area colloquial register), and several phrases are flagged `needsCheck: true` in `data/tamil.js` for a native speaker to review before this goes near real testers or the App Store — use Testing tools > Open the content review list on the home screen to see them all in one place.

## Testing tools
On the home screen, open "Testing tools" to unlock all lessons, show the Tamil script, or reset progress.

## What to measure with testers
- How many finish lesson 1, and how many return the next day
- Which lessons people abandon
- Whether the audio is clear and the speed comfortable
- Whether recording themselves feels useful
- Whether they would pay, and for what
