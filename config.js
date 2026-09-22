/* Settings you can change without touching the app code. */
window.APP_CONFIG = {
  // Changing the suffix clears everyone's saved progress (do this if you reorder lessons).
  storageKey: 'tamil-shikho-v2',

  // true  = play the recorded/generated files in /audio (recommended).
  // false = use the phone's built-in voice, which most iPhones do not have for Tamil.
  useRecordedAudio: true,
  audioDir: 'audio/',

  // Shows the "Testing tools" section on the home screen (unlock lessons, review list, reset).
  // Set to false for the public App Store release.
  showTestingTools: true,

  // Paste a Google Form / Tally / email link here to show a "Send feedback" button to testers.
  // Example: 'https://forms.gle/xxxx' or 'mailto:you@example.com?subject=Tamil%20app%20feedback'
  feedbackUrl: ''
};
