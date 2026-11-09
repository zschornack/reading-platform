/* ==========================================================================
   Reading Platform — pilot
   Plain JS, no build step. Everything lives in memory: closing or reloading
   the page clears all progress (by design, for the pilot).
   ========================================================================== */

/* ---------- Helpers ---------- */
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const now = () => performance.now();
const getBook = (id) => BOOKS.find((b) => b.id === id);

function formatDuration(ms) {
  const totalSec = Math.round(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${String(s).padStart(2, "0")}s`;
  return `${s}s`;
}
const wpmOf = (words, ms) => (ms > 0 && words > 0 ? Math.round(words / (ms / 60000)) : null);

/* ---------- Icons (inline SVG) ---------- */
const svg = (path, size = 22, extra = "") =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" ${extra}>${path}</svg>`;
const ICON = {
  pause: (s) => `<svg width="${s || 22}" height="${s || 22}" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="2"/><rect x="14" y="4" width="4" height="16" rx="2"/></svg>`,
  play: (s) => svg('<path d="M7 4.5v15l12-7.5z"/>', s),
  left: (s) => svg('<path d="M15 18l-6-6 6-6"/>', s),
  right: (s) => svg('<path d="M9 18l6-6-6-6"/>', s),
  down: (s) => svg('<path d="M6 9l6 6 6-6"/>', s),
  close: (s) => svg('<path d="M18 6L6 18M6 6l12 12"/>', s),
  check: (s) => svg('<path d="M20 6L9 17l-5-5"/>', s),
  bookmark: (s) => svg('<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>', s),
  moon: (s) => svg('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>', s),
  sun: (s) => svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>', s),
  library: (s) => svg('<path d="M4 4v16M9 4v16M14 4l5 16"/>', s),
  keyboard: (s) => svg('<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 13h.01M18 13h.01M8 16h8"/>', s),
  chart: (s) => svg('<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>', s),
  user: (s) => svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>', s),
  book: (s) => svg('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>', s),
  lock: (s) => svg('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>', s),
  flame: (s) => svg('<path d="M12 22c4 0 7-3 7-7 0-5-5-7-5-12-3 2-4 5-4 7-1-1-2-2-2-4-2 2-3 5-3 9 0 4 3 7 7 7z"/>', s),
};

/* ---------- App state (memory only) ---------- */
const state = {
  theme: "dark",
  progress: {}, // bookId -> reader progress (see createProgress)
  finishedBooks: new Set(),
  history: [], // one entry per completed session: words, ms, quiz result
  overlayBookId: null,
  accountMenuOpen: false,
};

function setTheme(theme) {
  state.theme = theme;
  document.documentElement.dataset.theme = theme;
}
setTheme("dark");

/* ---------- Book status ---------- */
function bookStatus(book) {
  if (state.finishedBooks.has(book.id)) return "read";
  const p = state.progress[book.id];
  if (p && p.maxPos > 0) return "progress";
  return "unread";
}
const STATUS_LABEL = { read: "Read", progress: "In progress", unread: "Not read yet" };
function statusIcon(status) {
  if (status === "read") return `<span class="status status-read" title="Read">${ICON.check(14)}</span>`;
  if (status === "progress") return `<span class="status status-progress" title="In progress"></span>`;
  return `<span class="status status-unread" title="Not read yet"></span>`;
}

function cover(book, cls = "") {
  return `<div class="cover ${cls}" style="--cover:${book.coverColor}">
    <span class="cover-emoji">${book.coverEmoji}</span>
    <span class="cover-title">${esc(book.title)}</span>
  </div>`;
}

/* ==========================================================================
   Router
   ========================================================================== */
let currentView = null;

function route() {
  const hash = location.hash || "#/home";
  const [, view, param] = hash.split("/");
  if (currentView === "reader" && view !== "read") Reader.leave();
  state.accountMenuOpen = false;

  if (view === "read" && getBook(param)?.available) {
    currentView = "reader";
    state.overlayBookId = null;
    Reader.enter(getBook(param));
    return;
  }
  currentView = ["library", "stats"].includes(view) ? view : "home";
  renderPage();
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", route);

/* ==========================================================================
   Pages: header, home, library, stats
   ========================================================================== */
function header() {
  const nav = (id, label, icon) =>
    `<a href="#/${id}" class="nav-link ${currentView === id ? "active" : ""}">${icon}<span>${label}</span></a>`;
  return `
  <header class="topbar">
    <a href="#/home" class="brand" aria-label="Home">
      <span class="brand-mark">${ICON.book(18)}</span>
      <span class="brand-name">Reading Platform</span>
    </a>
    <nav class="nav">
      ${nav("library", "Library", ICON.library(18))}
      ${nav("stats", "Stats", ICON.chart(18))}
      <button class="icon-btn" data-action="toggle-theme" title="Toggle dark mode">
        ${state.theme === "dark" ? ICON.sun(18) : ICON.moon(18)}
      </button>
      <div class="account">
        <button class="account-btn" data-action="toggle-account" aria-expanded="${state.accountMenuOpen}">
          <span class="avatar">S</span><span class="account-name">Account</span>${ICON.down(16)}
        </button>
        ${state.accountMenuOpen ? accountMenu() : ""}
      </div>
    </nav>
  </header>`;
}

function accountMenu() {
  return `
  <div class="menu" role="menu">
    <div class="menu-head">
      <span class="avatar avatar-lg">S</span>
      <div><strong>Student</strong><small>Pilot mode · data resets when the page closes</small></div>
    </div>
    <button class="menu-item" data-action="soon">${ICON.user(16)} Profile <em>Soon</em></button>
    <button class="menu-item" data-action="soon">${ICON.chart(16)} My stats</button>
    <button class="menu-item" data-action="toggle-theme">${state.theme === "dark" ? ICON.sun(16) : ICON.moon(16)} ${state.theme === "dark" ? "Light mode" : "Dark mode"}</button>
    <button class="menu-item" data-action="soon">${ICON.close(16)} Log out <em>Soon</em></button>
  </div>`;
}

function libraryGrid() {
  return `<div class="grid">${BOOKS.map((b) => {
    const st = bookStatus(b);
    return `
    <button class="book-card" data-action="open-book" data-id="${b.id}">
      ${cover(b)}
      <div class="book-meta">
        <div>
          <div class="book-title">${esc(b.title)}</div>
          <div class="book-age">${esc(b.ageRange)}</div>
        </div>
        ${statusIcon(st)}
      </div>
    </button>`;
  }).join("")}</div>`;
}

function homePage() {
  const inProgress = BOOKS.find((b) => b.available && bookStatus(b) === "progress");
  const streak = computeStreak();
  const startLabel = inProgress
    ? `${ICON.play(20)} Continue reading · ${esc(inProgress.title)}`
    : `${ICON.play(20)} Start new reading`;
  return `
  <main class="page">
    <section class="hero">
      <p class="eyebrow">Welcome</p>
      <h1>Hi, <span class="student-name">Student</span> 👋</h1>
      <p class="hero-sub">Pick a story and read at your own pace.</p>
      <div class="hero-actions">
        <button class="btn btn-primary btn-lg" data-action="start-reading">${startLabel}</button>
        <span class="chip">${ICON.flame(16)} ${streak} day streak</span>
      </div>
    </section>
    <section>
      <div class="section-head"><h2>Library</h2><a href="#/library" class="link">See all</a></div>
      ${libraryGrid()}
    </section>
  </main>`;
}

function libraryPage() {
  return `
  <main class="page">
    <div class="section-head page-title">
      <h1>Library</h1><span class="muted">${BOOKS.length} books</span>
    </div>
    ${libraryGrid()}
  </main>`;
}

function computeStreak() {
  if (!state.history.length) return 0;
  const days = new Set(state.history.map((h) => new Date(h.at).toDateString()));
  let streak = 0;
  const d = new Date();
  while (days.has(d.toDateString())) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function statsPage() {
  const h = state.history;
  const words = h.reduce((a, x) => a + x.words, 0);
  const ms = h.reduce((a, x) => a + x.ms, 0);
  const correct = h.filter((x) => x.correct).length;
  const wpm = wpmOf(words, ms);
  const tile = (label, value, sub = "") =>
    `<div class="tile"><span class="tile-label">${label}</span><span class="tile-value">${value}</span>${sub ? `<span class="tile-sub">${sub}</span>` : ""}</div>`;

  const rows = h
    .slice()
    .reverse()
    .map(
      (x) => `<tr>
        <td>${esc(x.bookTitle)}</td>
        <td>Ch. ${x.chapter} · ${esc(x.chapterTitle)}</td>
        <td>${x.session}</td>
        <td>${x.words}</td>
        <td>${formatDuration(x.ms)}</td>
        <td><strong>${wpmOf(x.words, x.ms) ?? "—"}</strong></td>
        <td>${x.correct ? '<span class="ok">✓</span>' : '<span class="bad">✗</span>'}</td>
      </tr>`
    )
    .join("");

  return `
  <main class="page">
    <div class="section-head page-title"><h1>Your stats</h1><span class="muted">This visit only</span></div>
    <div class="tiles">
      ${tile("Average speed", wpm ?? "—", "words per minute")}
      ${tile("Words read", words.toLocaleString("en-US"))}
      ${tile("Reading time", formatDuration(ms))}
      ${tile("Quiz accuracy", h.length ? Math.round((correct / h.length) * 100) + "%" : "—", h.length ? `${correct} of ${h.length}` : "")}
      ${tile("Streak", computeStreak(), "days in a row")}
      ${tile("Books finished", state.finishedBooks.size)}
    </div>
    <h2 class="sub-h">Reading history</h2>
    ${
      h.length
        ? `<div class="table-wrap"><table class="table">
            <thead><tr><th>Book</th><th>Chapter</th><th>Session</th><th>Words</th><th>Time</th><th>WPM</th><th>Quiz</th></tr></thead>
            <tbody>${rows}</tbody></table></div>`
        : `<div class="empty">No reading yet. Finish a session of a story and it will show up here.</div>`
    }
  </main>`;
}

function bookOverlay() {
  const b = getBook(state.overlayBookId);
  if (!b) return "";
  const st = bookStatus(b);
  const minutes = b.words ? Math.max(1, Math.round(b.words / 100)) : null;
  const label = !b.available ? "Coming soon" : st === "read" ? "READ AGAIN" : st === "progress" ? "CONTINUE" : "READ";
  return `
  <div class="overlay" data-action="close-overlay-bg">
    <div class="book-modal" role="dialog" aria-modal="true" aria-label="${esc(b.title)}">
      <button class="icon-btn modal-close" data-action="close-overlay" aria-label="Close">${ICON.close(20)}</button>
      ${cover(b, "cover-lg")}
      <div class="modal-body">
        <h2>${esc(b.title)}</h2>
        <div class="modal-tags">
          <span class="tag">${esc(b.ageRange)}</span>
          <span class="tag">${STATUS_LABEL[st]}</span>
          ${b.chapters ? `<span class="tag">${b.chapters.length} chapters</span><span class="tag">${b.words} words · ~${minutes} min</span>` : ""}
        </div>
        <p class="synopsis">${esc(b.synopsis)}</p>
        <button class="btn btn-primary btn-block" data-action="read-book" data-id="${b.id}" ${b.available ? "" : "disabled"}>${label}</button>
      </div>
    </div>
  </div>`;
}

function renderPage() {
  const body = currentView === "library" ? libraryPage() : currentView === "stats" ? statsPage() : homePage();
  document.getElementById("app").innerHTML = header() + body + bookOverlay();
  document.body.classList.toggle("no-scroll", !!state.overlayBookId);
}

function toast(msg) {
  let t = $(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.remove("show");
  void t.offsetWidth;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("show"), 2200);
}

/* Page-level clicks */
document.addEventListener("click", (e) => {
  if (currentView === "reader") return; // reader handles its own clicks
  const el = e.target.closest("[data-action]");

  // close the account menu when clicking anywhere else
  if (state.accountMenuOpen && !e.target.closest(".account")) {
    state.accountMenuOpen = false;
    renderPage();
  }
  if (!el) return;
  const action = el.dataset.action;

  if (action === "close-overlay-bg" && e.target !== el) return; // click was inside modal

  switch (action) {
    case "toggle-theme":
      setTheme(state.theme === "dark" ? "light" : "dark");
      renderPage();
      break;
    case "toggle-account":
      state.accountMenuOpen = !state.accountMenuOpen;
      renderPage();
      break;
    case "soon":
      state.accountMenuOpen = false;
      renderPage();
      toast("Coming soon — accounts arrive after the pilot.");
      break;
    case "open-book":
      state.overlayBookId = el.dataset.id;
      renderPage();
      break;
    case "close-overlay":
    case "close-overlay-bg":
      state.overlayBookId = null;
      renderPage();
      break;
    case "start-reading": {
      const inProgress = BOOKS.find((b) => b.available && bookStatus(b) === "progress");
      if (inProgress) {
        location.hash = `#/read/${inProgress.id}`;
      } else {
        const next = BOOKS.find((b) => b.available && bookStatus(b) === "unread") || BOOKS.find((b) => b.available);
        state.overlayBookId = next.id;
        renderPage();
      }
      break;
    }
    case "read-book": {
      const b = getBook(el.dataset.id);
      if (!b.available) return;
      if (bookStatus(b) === "read") delete state.progress[b.id]; // start over
      location.hash = `#/read/${b.id}`;
      break;
    }
  }
});

/* ==========================================================================
   Reader
   ========================================================================== */

/* Flatten the book into a list of "steps" the reader walks through with Next. */
function buildSteps(book) {
  const steps = [];
  book.chapters.forEach((ch, ci) => {
    steps.push({ type: "intro", ci });
    ch.sessions.forEach((se, si) => {
      se.sentences.forEach((_, ti) => steps.push({ type: "sentence", ci, si, ti }));
      steps.push({ type: "quiz", ci, si });
    });
    steps.push({ type: "chapterEnd", ci });
  });
  steps.push({ type: "bookEnd" });
  return steps;
}

function createProgress(book) {
  return {
    steps: buildSteps(book),
    pos: 0,
    maxPos: 0,
    counted: new Set(), // sentence ids already counted for WPM
    totals: { words: 0, ms: 0 }, // running WPM for the whole book
    sessionAcc: {}, // sessionId -> {words, ms}
    quiz: {}, // sessionId -> {selected, correct}
    totalSentences: book.chapters.reduce((a, c) => a + c.sessions.reduce((b, s) => b + s.sentences.length, 0), 0),
  };
}

const Reader = {
  book: null,
  p: null,
  paused: false,
  panel: "main", // pause menu panel: main | chapters | shortcuts
  // per-sentence stopwatch (pausable)
  segAcc: 0,
  segStart: null,
  // quiz UI state for the current quiz step
  selected: null,
  checked: false,

  enter(book) {
    this.book = book;
    this.p = state.progress[book.id] ||= createProgress(book);
    this.paused = false;
    this.panel = "main";
    document.body.classList.add("no-scroll");
    this.renderShell();
    this.enterStep();
  },

  leave() {
    this.stopClock();
    this.book = null;
    document.body.classList.remove("no-scroll");
  },

  get step() {
    return this.p.steps[this.p.pos];
  },
  chapter(ci) {
    return this.book.chapters[ci];
  },
  session(ci, si) {
    return this.book.chapters[ci].sessions[si];
  },

  /* ---- Stopwatch ---- */
  startClock() {
    if (this.segStart === null) this.segStart = now();
  },
  stopClock() {
    if (this.segStart !== null) {
      this.segAcc += now() - this.segStart;
      this.segStart = null;
    }
  },
  resetClock() {
    this.segAcc = 0;
    this.segStart = null;
  },
  elapsed() {
    return this.segAcc + (this.segStart !== null ? now() - this.segStart : 0);
  },

  /* Called every time a step is shown */
  enterStep() {
    const s = this.step;
    this.resetClock();
    this.selected = null;
    this.checked = false;
    if (s.type === "sentence" && !this.paused) this.startClock();
    this.renderStage();
    this.renderTop();
    this.renderBottom();
  },

  /* ---- Navigation ---- */
  primary() {
    if (this.paused) return;
    const s = this.step;

    if (s.type === "quiz" && !this.checked) {
      if (this.selected !== null) this.checkAnswer();
      return;
    }

    if (s.type === "sentence") this.recordSentence(s);

    if (s.type === "bookEnd") {
      location.hash = "#/library";
      return;
    }

    this.p.pos++;
    this.p.maxPos = Math.max(this.p.maxPos, this.p.pos);
    if (this.step.type === "bookEnd") state.finishedBooks.add(this.book.id);
    this.enterStep();
  },

  back() {
    if (this.paused) return;
    const s = this.step;
    if (s.type === "sentence" && s.ti > 0) {
      this.p.pos--;
      this.enterStep();
    }
  },

  /* WPM: each Next on a NEW sentence adds its words and the seconds spent on it
     to the running totals. WPM = total words / total minutes. Paused time and
     quiz/intro screens never count. Re-reading old sentences adds nothing. */
  recordSentence(s) {
    const sentence = this.session(s.ci, s.si).sentences[s.ti];
    const ms = this.elapsed();
    this.stopClock();
    if (this.p.counted.has(sentence.id)) return;
    this.p.counted.add(sentence.id);

    const seId = this.session(s.ci, s.si).id;
    const acc = (this.p.sessionAcc[seId] ||= { words: 0, ms: 0 });
    acc.words += sentence.words;
    acc.ms += ms;
    this.p.totals.words += sentence.words;
    this.p.totals.ms += ms;
  },

  checkAnswer() {
    const s = this.step;
    const se = this.session(s.ci, s.si);
    const correct = this.selected === se.quiz.answer;
    this.checked = true;

    if (!this.p.quiz[se.id]) {
      this.p.quiz[se.id] = { selected: this.selected, correct };
      const acc = this.p.sessionAcc[se.id] || { words: 0, ms: 0 };
      state.history.push({
        bookTitle: this.book.title,
        chapter: s.ci + 1,
        chapterTitle: this.chapter(s.ci).title,
        session: s.si + 1,
        words: acc.words,
        ms: acc.ms,
        correct,
        at: Date.now(),
      });
    }

    $$(".option", this.$stage).forEach((btn, i) => {
      btn.disabled = true;
      if (i === se.quiz.answer) btn.classList.add("correct");
      else if (i === this.selected) btn.classList.add("wrong");
    });
    if (correct) this.celebrate();
    this.renderBottom(correct);
  },

  selectOption(i) {
    if (this.checked || this.step.type !== "quiz") return;
    const opts = this.session(this.step.ci, this.step.si).quiz.options;
    if (i < 0 || i >= opts.length) return;
    this.selected = i;
    $$(".option", this.$stage).forEach((b, j) => b.classList.toggle("selected", j === i));
    this.renderBottom();
  },

  /* ---- Pause menu ---- */
  pause() {
    if (this.paused) return;
    this.paused = true;
    this.panel = "main";
    this.stopClock();
    this.renderPause();
  },
  resume() {
    this.paused = false;
    $(".pause", this.$root)?.remove();
    if (this.step.type === "sentence") this.startClock();
  },
  jumpToChapter(ci) {
    const idx = this.p.steps.findIndex((s) => s.type === "intro" && s.ci === ci);
    if (idx < 0 || idx > this.p.maxPos) return;
    this.p.pos = idx;
    this.resume();
    this.enterStep();
  },

  /* ==================== Rendering ==================== */
  renderShell() {
    const b = this.book;
    document.getElementById("app").innerHTML = `
    <div class="reader">
      <div class="reader-top">
        <div class="rt-left">
          <button class="square-btn" data-r="pause" aria-label="Pause">${ICON.pause(22)}</button>
          <div class="wpm"><span class="wpm-label">WPM</span><span class="wpm-value" id="wpm">—</span></div>
        </div>
        <button class="rt-right" data-r="pause" aria-label="Open menu">
          <div class="rt-text"><strong>${esc(b.title)}</strong><small id="rt-chapter"></small></div>
          ${cover(b, "cover-mini")}
        </button>
      </div>
      <div class="reader-stage" id="stage"></div>
      <div class="reader-bottom" id="bottom"></div>
    </div>`;
    this.$root = $(".reader");
    this.$stage = $("#stage");
    this.$bottom = $("#bottom");
  },

  renderTop() {
    const s = this.step;
    const ci = s.ci ?? this.book.chapters.length - 1;
    $("#rt-chapter").textContent = `${ci + 1}. ${this.chapter(ci).title}`;
    $("#wpm").textContent = wpmOf(this.p.totals.words, this.p.totals.ms) ?? "—";
  },

  renderStage() {
    const s = this.step;
    if (s.type === "sentence") return this.renderSentences(s);

    let html = "";
    if (s.type === "intro") {
      const ch = this.chapter(s.ci);
      html = `<div class="center-view intro">
        <div class="intro-icon">${ch.icon}</div>
        <p class="intro-num">${s.ci + 1}. Chapter</p>
        <h1 class="intro-title">${esc(ch.title)}</h1>
      </div>`;
    } else if (s.type === "quiz") {
      const q = this.session(s.ci, s.si).quiz;
      html = `<div class="center-view quiz">
        <p class="quiz-label">Quick check</p>
        <h2 class="quiz-q">${esc(q.question)}</h2>
        <div class="options">
          ${q.options.map((o, i) => `<button class="option" data-r="option" data-i="${i}"><span class="key">${i + 1}</span><span>${esc(o)}</span></button>`).join("")}
        </div>
      </div>`;
    } else if (s.type === "chapterEnd") {
      const ch = this.chapter(s.ci);
      const accs = ch.sessions.map((se) => this.p.sessionAcc[se.id] || { words: 0, ms: 0 });
      const words = accs.reduce((a, x) => a + x.words, 0);
      const ms = accs.reduce((a, x) => a + x.ms, 0);
      const right = ch.sessions.filter((se) => this.p.quiz[se.id]?.correct).length;
      html = this.summary(ch.icon, `Chapter ${s.ci + 1} complete!`, ch.title, words, ms, `${right}/${ch.sessions.length}`);
    } else if (s.type === "bookEnd") {
      const sessions = this.book.chapters.flatMap((c) => c.sessions);
      const right = sessions.filter((se) => this.p.quiz[se.id]?.correct).length;
      html = this.summary("🏆", `You finished ${esc(this.book.title)}!`, "Great job, Student!", this.p.totals.words, this.p.totals.ms, `${right}/${sessions.length}`);
    }
    this.$stage.innerHTML = html;
    this.$track = null;
  },

  summary(icon, title, sub, words, ms, quiz) {
    return `<div class="center-view summary">
      <div class="intro-icon pop">${icon}</div>
      <h1 class="summary-title">${title}</h1>
      <p class="muted">${esc(sub)}</p>
      <div class="summary-tiles">
        <div class="tile"><span class="tile-label">Speed</span><span class="tile-value">${wpmOf(words, ms) ?? "—"}</span><span class="tile-sub">WPM</span></div>
        <div class="tile"><span class="tile-label">Words</span><span class="tile-value">${words}</span></div>
        <div class="tile"><span class="tile-label">Time</span><span class="tile-value">${formatDuration(ms)}</span></div>
        <div class="tile"><span class="tile-label">Quiz</span><span class="tile-value">${quiz}</span></div>
      </div>
    </div>`;
  },

  /* Sentence view: read sentences above, current one highlighted,
     the next two blurred below. The track slides so the current one is centred. */
  renderSentences(s) {
    const se = this.session(s.ci, s.si);
    if (!this.$track || this.$track.dataset.session !== se.id) {
      this.$stage.innerHTML = `<div class="track" data-session="${se.id}">
        ${se.sentences.map((t, i) => `<p class="sentence" data-i="${i}">${esc(t.text)}</p>`).join("")}
      </div>`;
      this.$track = $(".track", this.$stage);
      this.$track.classList.add("no-anim");
    }
    $$(".sentence", this.$track).forEach((el, i) => {
      el.className =
        "sentence " +
        (i < s.ti ? "read" : i === s.ti ? "current" : i <= s.ti + 2 ? "upcoming" : "hidden");
    });
    this.centerTrack();
  },

  centerTrack() {
    if (!this.$track) return;
    const cur = $(".sentence.current", this.$track);
    if (!cur) return;
    const stageH = this.$stage.clientHeight;
    const y = stageH / 2 - (cur.offsetTop + cur.offsetHeight / 2);
    this.$track.style.transform = `translate(-50%, ${y}px)`;
    if (this.$track.classList.contains("no-anim")) {
      void this.$track.offsetWidth;
      this.$track.classList.remove("no-anim");
    }
  },

  renderBottom(result) {
    const s = this.step;
    const bar = this.$bottom;
    bar.className = "reader-bottom";
    const back = (enabled) =>
      `<button class="square-btn back-btn" data-r="back" ${enabled ? "" : "disabled"} aria-label="Back">${ICON.left(22)}</button>`;
    const next = (label, cls = "btn-primary", disabled = false) =>
      `<button class="btn ${cls} next-btn" data-r="primary" ${disabled ? "disabled" : ""}><span>${label}</span>${ICON.right(22)}</button>`;

    if (s.type === "quiz" && this.checked) {
      const q = this.session(s.ci, s.si).quiz;
      const ok = result ?? this.p.quiz[this.session(s.ci, s.si).id]?.correct;
      bar.classList.add(ok ? "is-correct" : "is-wrong");
      bar.innerHTML = `<div class="bottom-inner feedback">
        <div class="fb-text">
          <strong>${ok ? "Correct!" : "Not quite"}</strong>
          <span>${ok ? "Great reading!" : `Answer: ${esc(q.options[q.answer])}`}</span>
        </div>
        ${next("Continue", ok ? "btn-success" : "btn-danger")}
      </div>`;
      return;
    }

    let html;
    if (s.type === "intro") html = back(false) + next("Next");
    else if (s.type === "sentence") html = back(s.ti > 0) + next("Next");
    else if (s.type === "quiz") html = back(false) + next("Check", "btn-primary", this.selected === null);
    else if (s.type === "chapterEnd") html = back(false) + next("Continue");
    else html = back(false) + next("Back to library");
    bar.innerHTML = `<div class="bottom-inner">${html}</div>`;
  },

  celebrate() {
    const el = document.createElement("div");
    el.className = "celebrate";
    const sparks = Array.from({ length: 12 }, (_, i) => `<i style="--a:${i * 30}deg"></i>`).join("");
    el.innerHTML = `<div class="celebrate-inner"><div class="sparks">${sparks}</div><span>Correct!</span></div>`;
    this.$stage.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  },

  renderPause() {
    $(".pause", this.$root)?.remove();
    const b = this.book;
    const pct = this.p.counted.size / this.p.totalSentences;
    const C = 2 * Math.PI * 15;
    const ci = this.step.ci ?? b.chapters.length - 1;

    let left;
    if (this.panel === "chapters") {
      left = `
        <button class="pm-item" data-r="panel" data-panel="main">${ICON.left(20)}<span>Back</span></button>
        <div class="chapter-list">
          ${b.chapters.map((ch, i) => {
            const introIdx = this.p.steps.findIndex((s) => s.type === "intro" && s.ci === i);
            const endIdx = this.p.steps.findIndex((s) => s.type === "chapterEnd" && s.ci === i);
            const unlocked = introIdx <= this.p.maxPos;
            const done = endIdx <= this.p.maxPos;
            return `<button class="chapter-row ${i === ci ? "current" : ""}" data-r="chapter" data-ci="${i}" ${unlocked ? "" : "disabled"}>
              <span class="ch-icon">${ch.icon}</span>
              <span class="ch-text"><small>Chapter ${i + 1}</small>${esc(ch.title)}</span>
              <span class="ch-state">${done ? ICON.check(16) : unlocked ? "" : ICON.lock(16)}</span>
            </button>`;
          }).join("")}
        </div>`;
    } else if (this.panel === "shortcuts") {
      const row = (k, d) => `<div class="sc-row"><span>${k}</span><span>${d}</span></div>`;
      left = `
        <button class="pm-item" data-r="panel" data-panel="main">${ICON.left(20)}<span>Back</span></button>
        <div class="shortcuts">
          ${row("<kbd>Enter</kbd> <kbd>Space</kbd> <kbd>→</kbd>", "Next / Check / Continue")}
          ${row("<kbd>←</kbd>", "Previous sentence")}
          ${row("<kbd>1</kbd>–<kbd>4</kbd>", "Pick a quiz answer")}
          ${row("<kbd>Esc</kbd> <kbd>P</kbd>", "Pause / resume")}
        </div>`;
    } else {
      left = `
        <button class="pm-continue" data-r="resume"><span class="pm-play">${ICON.play(26)}</span><span>Continue</span></button>
        <div class="pm-list">
          <button class="pm-item" data-r="panel" data-panel="chapters"><span class="pm-ic">${ICON.bookmark(18)}</span><span>Chapters</span></button>
          <button class="pm-item" data-r="theme"><span class="pm-ic">${state.theme === "dark" ? ICON.sun(18) : ICON.moon(18)}</span><span>${state.theme === "dark" ? "Day Mode" : "Night Mode"}</span></button>
          <button class="pm-item" data-r="library"><span class="pm-ic">${ICON.library(18)}</span><span>To Library</span></button>
        </div>
        <button class="pm-item pm-bottom" data-r="panel" data-panel="shortcuts"><span class="pm-ic">${ICON.keyboard(18)}</span><span>Shortcuts</span></button>`;
    }

    const el = document.createElement("div");
    el.className = "pause";
    el.innerHTML = `
      <div class="pm-left">${left}</div>
      <div class="pm-cover">${cover(b, "cover-tilt")}</div>
      <div class="pm-right">
        <div class="rt-text"><strong>${esc(b.title)}</strong><small>${ci + 1}. ${esc(this.chapter(ci).title)}</small></div>
        <svg class="ring" width="40" height="40" viewBox="0 0 40 40" title="${Math.round(pct * 100)}% read">
          <circle cx="20" cy="20" r="15" class="ring-bg"/>
          <circle cx="20" cy="20" r="15" class="ring-fg" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct)}"/>
        </svg>
      </div>`;
    this.$root.appendChild(el);
  },
};

/* Reader clicks */
document.addEventListener("click", (e) => {
  if (currentView !== "reader") return;
  const el = e.target.closest("[data-r]");
  if (!el || el.disabled) return;
  const r = el.dataset.r;
  switch (r) {
    case "pause": Reader.pause(); break;
    case "resume": Reader.resume(); break;
    case "primary": Reader.primary(); break;
    case "back": Reader.back(); break;
    case "option": Reader.selectOption(Number(el.dataset.i)); break;
    case "panel": Reader.panel = el.dataset.panel; Reader.renderPause(); break;
    case "chapter": Reader.jumpToChapter(Number(el.dataset.ci)); break;
    case "theme": setTheme(state.theme === "dark" ? "light" : "dark"); Reader.renderPause(); break;
    case "library": location.hash = "#/library"; break;
  }
});

/* Keyboard */
document.addEventListener("keydown", (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;

  if (currentView !== "reader") {
    if (e.key === "Escape" && (state.overlayBookId || state.accountMenuOpen)) {
      state.overlayBookId = null;
      state.accountMenuOpen = false;
      renderPage();
    }
    return;
  }

  const k = e.key;
  if (Reader.paused) {
    if (k === "Escape" || k === "p" || k === "P") {
      e.preventDefault();
      if (Reader.panel !== "main") { Reader.panel = "main"; Reader.renderPause(); }
      else Reader.resume();
    }
    return;
  }
  if (k === "Escape" || k === "p" || k === "P") { e.preventDefault(); Reader.pause(); }
  else if (k === "Enter" || k === " " || k === "ArrowRight") { e.preventDefault(); document.activeElement?.blur(); Reader.primary(); }
  else if (k === "ArrowLeft") { e.preventDefault(); Reader.back(); }
  else if (/^[1-9]$/.test(k)) { Reader.selectOption(Number(k) - 1); }
});

/* Auto-pause when the student switches tab / minimises: the clock must not run. */
document.addEventListener("visibilitychange", () => {
  if (document.hidden && currentView === "reader" && Reader.book) Reader.pause();
});

window.addEventListener("resize", () => {
  if (currentView === "reader") Reader.centerTrack();
});

route();
