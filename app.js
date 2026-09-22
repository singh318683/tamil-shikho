/* Tamil Shikho v2: speaking-first prototype. No build step, no dependencies. */
(function () {
  'use strict';

  const C = window.COURSE;
  const CFG = window.APP_CONFIG || {};
  const KEY = CFG.storageKey || 'tamil-shikho-v2';
  const root = document.getElementById('app');

  /* ---------- helpers ---------- */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = (a) => {
    const b = a.slice();
    for (let i = b.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [b[i], b[j]] = [b[j], b[i]];
    }
    return b;
  };
  const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const pad = (n) => String(n).padStart(2, '0');
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  const dayDiff = (a, b) => Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);
  const romSize = (t) => (t.length <= 9 ? 'r1' : t.length <= 18 ? 'r2' : t.length <= 28 ? 'r3' : 'r4');

  /* ---------- course data ---------- */
  const lessons = C.lessons;
  const byId = {};
  const idx = {};
  const itemById = {};
  const itemByRom = {};
  const pool = { word: [], phrase: [] };
  lessons.forEach((l, i) => {
    byId[l.id] = l;
    idx[l.id] = i;
    (l.items || []).forEach((it) => {
      it.id = slug(it.rom);
      it.kind = l.kind;
      it.lessonId = l.id;
      itemById[it.id] = it;
      itemByRom[it.rom] = it;
      pool[l.kind].push(it);
    });
  });
  lessons.forEach((l) => { l.pairItems = (l.pairs || []).map((p) => [l.items[p[0]], l.items[p[1]]]); });

  function itemsFor(l) {
    if (!l.from) return l.items.slice();
    const seen = new Set();
    const src = [];
    l.from.forEach((id) => byId[id].items.forEach((it) => { if (!seen.has(it.id)) { seen.add(it.id); src.push(it); } }));
    return shuffle(src).slice(0, l.count || 10);
  }

  /* ---------- exercises ---------- */
  function distractors(it, field, n) {
    const own = byId[it.lessonId].items.filter((x) => x !== it);
    const far = pool[it.kind].filter((x) => x.lessonId !== it.lessonId);
    const seen = new Set([it[field]]);
    const out = [];
    for (const c of shuffle(own).concat(shuffle(far))) {
      const v = c[field];
      if (!seen.has(v)) { seen.add(v); out.push(v); if (out.length === n) break; }
    }
    return out;
  }
  function makeGraded(type, it) {
    const f = type === 'hear-en' ? 'en' : 'rom';
    return { type, item: it, correct: it[f], options: shuffle([it[f]].concat(distractors(it, f, 3))), retry: false };
  }
  function makeReply(q, a) {
    const seen = new Set([a.rom]);
    const out = [];
    for (const c of shuffle(pool.phrase)) {
      if (c.lessonId !== a.lessonId && c !== q && !seen.has(c.rom)) { seen.add(c.rom); out.push(c.rom); if (out.length === 3) break; }
    }
    return { type: 'reply', item: q, answer: a, correct: a.rom, options: shuffle([a.rom].concat(out)), retry: false };
  }
  function makeExercises(l, items) {
    const cp = !!l.from;
    const first = [];
    const rest = [];
    items.forEach((it) => {
      const t = shuffle(['hear-en', 'en-rom']);
      first.push(makeGraded(t[0], it));
      rest.push(makeGraded(t[1], it));
    });
    const cap = cp ? 12 : 8;
    const core = shuffle(first.concat(shuffle(rest).slice(0, Math.max(0, cap - first.length))));
    const pairs = cp
      ? shuffle([].concat(...l.from.map((id) => byId[id].pairItems))).slice(0, 2)
      : l.pairItems;
    const replies = shuffle(pairs.map((p) => makeReply(p[0], p[1])));
    const speak = shuffle(items).slice(0, 3).map((it) => ({ type: 'speak', item: it, retry: false }));
    return core.concat(replies, speak);
  }
  const isGraded = (ex) => ex.type !== 'speak';
  const autoFor = (ex) => (ex.type === 'en-rom' ? null : ex.item);

  /* ---------- progress (saved in this browser only) ---------- */
  const DEFAULTS = () => ({ done: {}, xp: 0, streak: 0, lastDay: null, unlockAll: false, showScript: false });
  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
      return Object.assign(DEFAULTS(), raw, { done: Object.assign({}, raw.done) });
    } catch (e) { return DEFAULTS(); }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) { /* private mode: ignore */ } }
  let P = load();
  const isDone = (id) => !!P.done[id];
  const liveStreak = () => (P.lastDay && dayDiff(P.lastDay, today()) <= 1 ? P.streak : 0);
  function bumpStreak() {
    const t = today();
    if (P.lastDay === t) return;
    P.streak = P.lastDay && dayDiff(P.lastDay, t) === 1 ? P.streak + 1 : 1;
    P.lastDay = t;
  }
  const unlocked = (l) => P.unlockAll || idx[l.id] === 0 || isDone(lessons[idx[l.id] - 1].id);

  /* ---------- audio playback ---------- */
  const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
  let voices = [];
  let current = null;
  function refreshVoices() { if (synth) voices = synth.getVoices() || []; }
  const guVoice = () => voices.find((v) => String(v.lang || '').toLowerCase().replace('_', '-').indexOf(C.voiceLang) === 0);
  refreshVoices();
  if (synth) {
    const onVoices = () => { refreshVoices(); if (view === 'home') render(); };
    if (synth.addEventListener) synth.addEventListener('voiceschanged', onVoices); else synth.onvoiceschanged = onVoices;
  }
  let toastTimer = null;
  function toast(msg) {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.remove(); }, 3600);
  }
  function stopAudio() {
    if (current) { try { current.pause(); } catch (e) { /* ignore */ } current = null; }
    if (synth) synth.cancel();
  }
  function speakTTS(text, slow, onend) {
    if (!synth) { toast('This browser cannot play audio.'); return; }
    refreshVoices();
    const v = guVoice();
    if (!v) { toast('No Gujarati voice on this device. The audio files are needed here.'); return; }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.voice = v; u.lang = v.lang; u.rate = slow ? 0.55 : 0.85;
    if (onend) u.onend = onend;
    synth.speak(u);
  }
  function play(it, slow, onend) {
    if (!it) return;
    stopAudio();
    if (CFG.useRecordedAudio) {
      let fell = false;
      const fallback = () => { if (!fell) { fell = true; speakTTS(it.gu, slow, onend); } };
      const a = new Audio((CFG.audioDir || 'audio/') + it.id + (slow ? '-slow' : '') + '.mp3');
      current = a;
      a.addEventListener('error', fallback);
      if (onend) a.addEventListener('ended', onend);
      const p = a.play();
      if (p && p.catch) p.catch(fallback);
      return;
    }
    speakTTS(it.gu, slow, onend);
  }

  /* ---------- microphone recording (practise speaking) ---------- */
  const canRecord = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  const rec = { state: 'idle', mr: null, stream: null, chunks: [], url: null, ex: null };
  function resetRec() {
    if (rec.mr && rec.mr.state !== 'inactive') { rec.mr.onstop = null; try { rec.mr.stop(); } catch (e) { /* ignore */ } }
    if (rec.stream) rec.stream.getTracks().forEach((t) => t.stop());
    if (rec.url) URL.revokeObjectURL(rec.url);
    rec.state = 'idle'; rec.mr = null; rec.stream = null; rec.chunks = []; rec.url = null; rec.ex = null;
  }
  function startRec() {
    stopAudio();
    const ex = session && session.queue[session.qi];
    if (rec.url) { URL.revokeObjectURL(rec.url); rec.url = null; }
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      rec.stream = stream; rec.chunks = []; rec.ex = ex;
      const mr = new MediaRecorder(stream);
      rec.mr = mr;
      mr.ondataavailable = (e) => { if (e.data && e.data.size) rec.chunks.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(rec.chunks, { type: mr.mimeType || 'audio/mp4' });
        rec.url = URL.createObjectURL(blob);
        rec.state = 'ready';
        if (rec.ex && !rec.ex.recorded && session) { rec.ex.recorded = true; session.spoken++; }
        render();
      };
      mr.start();
      rec.state = 'recording';
      render();
    }).catch(() => {
      rec.state = 'idle';
      toast('The microphone is blocked. Allow it in your browser settings to practise speaking.');
      render();
    });
  }
  function stopRec() { if (rec.mr && rec.mr.state !== 'inactive') rec.mr.stop(); }
  function playMine() {
    if (!rec.url) return;
    stopAudio();
    const a = new Audio(rec.url);
    current = a;
    const p = a.play();
    if (p && p.catch) p.catch(() => toast('Could not play your recording.'));
  }

  /* ---------- state ---------- */
  let view = 'home';          // home | lesson | review
  let session = null;
  let autoplay = null;
  let scrollTop = false;
  let toolsOpen = false;

  function startLesson(id) {
    const l = byId[id];
    const items = itemsFor(l);
    resetRec();
    session = {
      lesson: l, items,
      phase: l.from ? 'quiz' : 'learn',
      card: 0, qi: 0, picked: null, ok: false,
      queue: makeExercises(l, items),
      right: 0, tried: 0, spoken: 0
    };
    view = 'lesson';
    scrollTop = true;
    autoplay = session.phase === 'learn' ? items[0] : autoFor(session.queue[0]);
    render();
  }
  function goHome() { stopAudio(); resetRec(); view = 'home'; session = null; scrollTop = true; render(); }

  function pick(i) {
    const s = session;
    const ex = s.queue[s.qi];
    if (s.picked !== null || !isGraded(ex)) return;
    s.picked = i;
    s.ok = ex.options[i] === ex.correct;
    if (!ex.retry) {
      s.tried++;
      if (s.ok) s.right++;
      else s.queue.push(Object.assign({}, ex, { retry: true, options: shuffle(ex.options) }));
    }
    render();
    if (ex.type === 'en-rom') play(ex.item);
  }

  function next() {
    const s = session;
    if (s.phase === 'learn') {
      if (s.card < s.items.length - 1) {
        s.card++;
        autoplay = s.items[s.card];
      } else {
        s.phase = 'quiz'; s.qi = 0; s.picked = null;
        autoplay = autoFor(s.queue[0]);
      }
      render();
      return;
    }
    resetRec();
    s.qi++; s.picked = null;
    if (s.qi >= s.queue.length) { finish(); return; }
    autoplay = autoFor(s.queue[s.qi]);
    render();
  }

  function finish() {
    const s = session;
    const acc = s.tried ? s.right / s.tried : 1;
    const xp = 10 + s.right * 2 + s.spoken * 3;
    const prev = P.done[s.lesson.id];
    P.done[s.lesson.id] = { best: Math.max(prev ? prev.best : 0, Math.round(acc * 100)) };
    P.xp += xp;
    bumpStreak();
    save();
    s.phase = 'result'; s.acc = acc; s.xp = xp;
    scrollTop = true;
    render();
  }

  /* ---------- views ---------- */
  function homeView() {
    const nextL = lessons.find((l) => !isDone(l.id));
    const started = Object.keys(P.done).length > 0;
    let h = '<header class="hero">' +
      '<div class="stats"><span class="pill">' + liveStreak() + ' day streak</span><span class="pill">' + P.xp + ' XP</span></div>' +
      '<h1 class="wordmark ta" lang="ta">' + esc(C.nativeName) + '</h1>' +
      '<p class="hero-sub">Learn to speak ' + esc(C.name) + '. Listen, understand and answer, no reading needed.</p></header>';
    h += '<main class="home-body">';
    if (nextL) {
      h += '<section class="resume"><div class="tile mini' + (nextL.icon.length > 2 ? ' long' : '') + '">' + esc(nextL.icon) + '</div>' +
        '<div class="resume-text"><h2>' + esc(nextL.title) + '</h2><p>' + (started ? 'Pick up where you left off' : 'Start with a greeting') + '</p></div>' +
        '<button class="btn" data-a="open" data-id="' + nextL.id + '">' + (started ? 'Continue' : 'Start') + '</button></section>';
    } else {
      h += '<section class="resume finished"><h2>You finished the course</h2><p>Repeat any lesson to keep it fresh.</p></section>';
    }
    if (!CFG.useRecordedAudio && !guVoice()) {
      h += '<p class="note">' + (synth
        ? 'This device has no Gujarati voice, so the sound buttons stay silent. Audio files fix this: set useRecordedAudio to true in config.js.'
        : 'This browser cannot play audio, so the sound buttons will not work.') + '</p>';
    }
    C.levels.forEach((lv) => {
      const ls = lessons.filter((l) => l.level === lv.id);
      const doneN = ls.filter((l) => isDone(l.id)).length;
      h += '<section class="level"><h2>' + esc(lv.title) + '</h2><p class="level-sub">' + esc(lv.sub) + '. ' + doneN + ' of ' + ls.length + ' done.</p><ol class="trail">';
      ls.forEach((l) => {
        const done = isDone(l.id);
        const open = unlocked(l);
        const cur = nextL && nextL.id === l.id;
        const state = done ? 'done' : cur ? 'current' : open ? 'open' : 'locked';
        const sub = l.from ? 'Mixed review' : l.items.length + (l.kind === 'phrase' ? ' phrases' : ' words');
        h += '<li><button class="stop ' + state + '" data-a="open" data-id="' + l.id + '"' + (open ? '' : ' disabled aria-label="' + esc(l.title) + ' (locked)"') + '>' +
          '<span class="badge' + (l.icon.length > 2 ? ' long' : '') + '">' + (open ? esc(l.icon) : '🔒') + '</span>' +
          '<span><span class="stop-title">' + esc(l.title) + '</span><span class="stop-sub">' + esc(sub) + '</span></span></button></li>';
      });
      h += '</ol></section>';
    });
    if (CFG.showTestingTools !== false) h += '<details class="tools"' + (toolsOpen ? ' open' : '') + '><summary>Testing tools</summary>' +
      '<label class="check"><input type="checkbox" data-a="toggle-unlock"' + (P.unlockAll ? ' checked' : '') + '> Unlock all lessons</label>' +
      '<label class="check"><input type="checkbox" data-a="toggle-script"' + (P.showScript ? ' checked' : '') + '> Show Gujarati script</label>' +
      '<button class="link" data-a="review">Open the content review list</button>' +
      (CFG.feedbackUrl ? '<a class="link" href="' + esc(CFG.feedbackUrl) + '" target="_blank" rel="noopener">Send feedback</a>' : '') +
      '<button class="link danger" data-a="reset">Reset my progress</button></details>';
    return h + '</main>';
  }

  function lessonView() {
    const s = session;
    const learnN = s.lesson.from ? 0 : s.items.length;
    const steps = learnN + s.queue.length;
    const doneSteps = s.phase === 'learn' ? s.card : s.phase === 'result' ? steps : learnN + s.qi + (s.picked !== null ? 1 : 0);
    const pct = Math.round((doneSteps / steps) * 100);
    let h = '<div class="lesson"><div class="top"><button class="x" data-a="quit" aria-label="Leave lesson">✕</button>' +
      '<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><i style="width:' + pct + '%"></i></div></div>';
    if (s.phase === 'learn') h += learnView(s);
    else if (s.phase === 'quiz') h += quizView(s);
    else h += resultView(s);
    return h + '</div>';
  }

  const phraseTile = (it, stamp) => '<div class="tile roman ' + romSize(it.rom) + (stamp ? ' stamp' : '') + '">' + esc(it.rom) + '</div>';
  const scriptLine = (it) => (P.showScript ? '<p class="ta-line ta" lang="ta">' + esc(it.gu) + '</p>' : '');
  const soundButtons = (it) =>
    '<div class="row-btns"><button class="btn ghost listen" data-a="speak" data-id="' + it.id + '">Listen</button>' +
    '<button class="btn ghost slow" data-a="speak-slow" data-id="' + it.id + '">Slow</button></div>';

  function learnView(s) {
    const it = s.items[s.card];
    const last = s.card === s.items.length - 1;
    return '<section class="stage">' +
      '<p class="count">' + (s.card + 1) + ' of ' + s.items.length + '</p>' +
      phraseTile(it, true) +
      '<p class="mean">' + esc(it.en) + '</p>' +
      (it.extra ? '<p class="extra">' + esc(it.extra) + '</p>' : '') +
      scriptLine(it) +
      soundButtons(it) +
      (it.note ? '<p class="tip">' + esc(it.note) + '</p>' : '') +
      (s.card === 0 && s.lesson.tip ? '<p class="tip">' + esc(s.lesson.tip) + '</p>' : '') +
      '</section><footer class="dock"><button class="btn wide" data-a="next">' + (last ? 'Start practice' : 'Continue') + '</button></footer>';
  }

  function feedback(ex, ok) {
    const it = ex.item;
    let body;
    if (ex.type === 'reply') {
      body = '<span class="say">' + esc(it.rom) + '</span> means ' + esc(it.en) + '. A good reply is <span class="say">' + esc(ex.answer.rom) + '</span> (' + esc(ex.answer.en) + ').';
    } else {
      body = '<span class="say">' + esc(it.rom) + '</span> means ' + esc(it.en) + '.';
    }
    if (P.showScript) body += ' <span class="ta" lang="ta">' + esc(it.gu) + '</span>';
    return '<strong>' + (ok ? 'Correct' : 'Not quite') + '</strong>' + body;
  }

  function quizView(s) {
    const ex = s.queue[s.qi];
    const it = ex.item;
    if (ex.type === 'speak') return speakView(s, ex);
    const answered = s.picked !== null;
    let prompt = '';
    let stim = '';
    if (ex.type === 'hear-en') {
      prompt = 'What did you hear?';
      stim = soundButtons(it);
    } else if (ex.type === 'reply') {
      prompt = 'Listen, then pick the best reply';
      stim = soundButtons(it);
    } else {
      prompt = 'How do you say this?';
      stim = '<p class="ask">' + esc(it.en) + '</p>';
    }
    const twoCol = ex.type === 'en-rom' && ex.options.every((o) => o.length <= 12);
    let h = '<section class="quiz"><h2 class="prompt">' + prompt + '</h2>' + stim + '<div class="opts' + (twoCol ? ' g2' : '') + '">';
    ex.options.forEach((o, i) => {
      let c = 'opt';
      if (answered) { if (o === ex.correct) c += ' right'; else if (i === s.picked) c += ' wrong'; }
      let inner = esc(o);
      if (ex.type === 'reply') {
        const oi = itemByRom[o];
        inner = '<span class="o-rom">' + esc(o) + '</span><span class="o-en">' + esc(oi ? oi.en : '') + '</span>';
      }
      h += '<button class="' + c + '" data-a="pick" data-i="' + i + '"' + (answered ? ' disabled' : '') + '>' + inner + '</button>';
    });
    h += '</div></section>';
    if (!answered) return h + '<footer class="dock"><button class="btn wide" disabled>Continue</button></footer>';
    return h + '<footer class="dock ' + (s.ok ? 'good' : 'bad') + '"><div class="fb" role="status">' + feedback(ex, s.ok) + '</div>' +
      '<button class="btn wide" data-a="next">Continue</button></footer>';
  }

  function speakView(s, ex) {
    const it = ex.item;
    let ctrl;
    if (!canRecord()) {
      ctrl = '<p class="say-hint">Say it out loud, then continue.</p>';
    } else if (rec.state === 'recording') {
      ctrl = '<button class="btn rec on" data-a="rec-stop">Stop</button><p class="say-hint" role="status">Recording. Say it now.</p>';
    } else if (rec.state === 'ready') {
      ctrl = '<div class="row-btns"><button class="btn ghost" data-a="rec-play">Play mine</button>' +
        '<button class="btn ghost" data-a="rec-compare">Compare</button></div>' +
        '<button class="btn rec" data-a="rec-start">Record again</button>' +
        '<p class="say-hint">Compare plays the model first, then your voice.</p>';
    } else {
      ctrl = '<button class="btn rec" data-a="rec-start">Record</button><p class="say-hint">Listen first, then record yourself saying it.</p>';
    }
    return '<section class="quiz speak"><h2 class="prompt">Now you say it</h2>' +
      phraseTile(it, false) + '<p class="mean">' + esc(it.en) + '</p>' + scriptLine(it) + soundButtons(it) +
      '<div class="rec-zone">' + ctrl + '</div></section>' +
      '<footer class="dock"><button class="btn wide" data-a="next"' + (rec.state === 'recording' ? ' disabled' : '') + '>Continue</button></footer>';
  }

  function resultView(s) {
    const pct = Math.round(s.acc * 100);
    const msg = pct >= 90 ? 'Excellent work.' : pct >= 70 ? 'Good work.' : 'Repeating this lesson helps the sounds stick.';
    return '<section class="stage result"><div class="tile big stamp">✓</div>' +
      '<h1>' + (s.lesson.from ? 'Checkpoint complete' : 'Lesson complete') + '</h1>' +
      '<p class="mean">' + s.right + ' of ' + s.tried + ' right on the first try. ' + msg + '</p>' +
      (s.spoken ? '<p class="mean">You practised speaking ' + s.spoken + (s.spoken === 1 ? ' phrase.' : ' phrases.') + '</p>' : '') +
      '<p class="xp">+' + s.xp + ' XP</p></section>' +
      '<footer class="dock row"><button class="btn ghost" data-a="again">Practice again</button><button class="btn" data-a="home">Continue</button></footer>';
  }

  function reviewView() {
    let h = '<div class="rv"><h1>Content review</h1>' +
      '<p>For a native speaker to check. Read each row and note anything wrong: the Gujarati spelling, the transliteration, the meaning, or how it sounds in the audio. Highlighted rows are the ones we are least sure about. Audio files are named from the "said as" text.</p>' +
      '<div class="rv-actions"><button class="btn" data-a="copy-csv">Copy as CSV</button><button class="btn ghost" data-a="home">Back to the course</button></div>';
    lessons.forEach((l) => {
      if (!l.items) return;
      h += '<h2>' + esc(l.title) + '</h2><div class="rv-scroll"><table><thead><tr><th>Said as</th><th>Gujarati</th><th>Meaning</th><th>Audio file</th></tr></thead><tbody>';
      l.items.forEach((it) => {
        h += '<tr' + (it.check ? ' class="flag"' : '') + '><td>' + esc(it.rom) + '</td><td class="ta" lang="ta">' + esc(it.gu) + '</td><td>' + esc(it.en) + (it.check ? ' <strong>(please check)</strong>' : '') + '</td><td><code>' + it.id + '.mp3</code></td></tr>';
      });
      h += '</tbody></table></div>';
      if (l.pairItems.length) {
        h += '<p>Conversations in this lesson: ' + l.pairItems.map((p) => esc(p[0].rom) + ' → ' + esc(p[1].rom)).join('; ') + '</p>';
      }
    });
    return h + '</div>';
  }
  function copyCsv() {
    const q = (v) => '"' + String(v).replace(/"/g, '""') + '"';
    const lines = [['audio_file', 'lesson', 'said_as', 'gujarati', 'meaning', 'needs_native_check'].map(q).join(',')];
    lessons.forEach((l) => (l.items || []).forEach((it) => lines.push([it.id + '.mp3', l.title, it.rom, it.gu, it.en, it.check ? 'yes' : ''].map(q).join(','))));
    const text = lines.join('\n');
    const fallback = () => {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast('Copied. Paste it into a spreadsheet.'); } catch (e) { toast('Could not copy on this browser.'); }
      ta.remove();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => toast('Copied. Paste it into a spreadsheet.'), fallback);
    } else fallback();
  }

  /* ---------- render and events ---------- */
  function render() {
    root.innerHTML = view === 'home' ? homeView() : view === 'review' ? reviewView() : lessonView();
    if (scrollTop) { window.scrollTo(0, 0); scrollTop = false; }
    if (autoplay) { const it = autoplay; autoplay = null; play(it); }
  }

  root.addEventListener('click', (e) => {
    const el = e.target.closest('[data-a]');
    if (!el || el.disabled) return;
    switch (el.dataset.a) {
      case 'open': startLesson(el.dataset.id); break;
      case 'speak': play(itemById[el.dataset.id]); break;
      case 'speak-slow': play(itemById[el.dataset.id], true); break;
      case 'next': next(); break;
      case 'pick': pick(Number(el.dataset.i)); break;
      case 'rec-start': startRec(); break;
      case 'rec-stop': stopRec(); break;
      case 'rec-play': playMine(); break;
      case 'rec-compare': play(session.queue[session.qi].item, false, playMine); break;
      case 'quit': if (window.confirm('Leave this lesson? Your answers in it will not be saved.')) goHome(); break;
      case 'home': goHome(); break;
      case 'again': startLesson(session.lesson.id); break;
      case 'review': view = 'review'; scrollTop = true; render(); break;
      case 'copy-csv': copyCsv(); break;
      case 'toggle-unlock': P.unlockAll = el.checked; save(); toolsOpen = true; render(); break;
      case 'toggle-script': P.showScript = el.checked; save(); break;
      case 'reset':
        if (window.confirm('Reset all progress on this device?')) { P = DEFAULTS(); save(); toolsOpen = false; render(); }
        break;
      default: break;
    }
  });
  root.addEventListener('toggle', (e) => { if (e.target.classList && e.target.classList.contains('tools')) toolsOpen = e.target.open; }, true);

  render();
})();
