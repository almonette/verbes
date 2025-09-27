// ======= Data de base =======

// Personnes dans l’ordre (clé courte pour comparer)
const PERSONNES = [
  { code: '1s', label: 'je / j’', sujet: 'je' },
  { code: '2s', label: 'tu', sujet: 'tu' },
  { code: '3s', label: 'il/elle', sujet: 'il' },
  { code: '1p', label: 'nous', sujet: 'nous' },
  { code: '2p', label: 'vous', sujet: 'vous' },
  { code: '3p', label: 'ils/elles', sujet: 'ils' },
];

const TEMPS = ['présent', 'imparfait', 'futur simple', 'conditionnel présent'];

// Dataset complet pour 5 verbes (être, avoir, aller, finir, aimer)
// Format: conj[temps][codePersonne] = "forme conjuguée SANS sujet"
const CONJ = {
  être: {
    présent: { '1s': 'suis', '2s': 'es', '3s': 'est', '1p': 'sommes', '2p': 'êtes', '3p': 'sont' },
    imparfait: {
      '1s': 'étais',
      '2s': 'étais',
      '3s': 'était',
      '1p': 'étions',
      '2p': 'étiez',
      '3p': 'étaient',
    },
    'futur simple': {
      '1s': 'serai',
      '2s': 'seras',
      '3s': 'sera',
      '1p': 'serons',
      '2p': 'serez',
      '3p': 'seront',
    },
    'conditionnel présent': {
      '1s': 'serais',
      '2s': 'serais',
      '3s': 'serait',
      '1p': 'serions',
      '2p': 'seriez',
      '3p': 'seraient',
    },
  },
  avoir: {
    présent: { '1s': 'ai', '2s': 'as', '3s': 'a', '1p': 'avons', '2p': 'avez', '3p': 'ont' },
    imparfait: {
      '1s': 'avais',
      '2s': 'avais',
      '3s': 'avait',
      '1p': 'avions',
      '2p': 'aviez',
      '3p': 'avaient',
    },
    'futur simple': {
      '1s': 'aurai',
      '2s': 'auras',
      '3s': 'aura',
      '1p': 'aurons',
      '2p': 'aurez',
      '3p': 'auront',
    },
    'conditionnel présent': {
      '1s': 'aurais',
      '2s': 'aurais',
      '3s': 'aurait',
      '1p': 'aurions',
      '2p': 'auriez',
      '3p': 'auraient',
    },
  },
  aller: {
    présent: { '1s': 'vais', '2s': 'vas', '3s': 'va', '1p': 'allons', '2p': 'allez', '3p': 'vont' },
    imparfait: {
      '1s': 'allais',
      '2s': 'allais',
      '3s': 'allait',
      '1p': 'allions',
      '2p': 'alliez',
      '3p': 'allaient',
    },
    'futur simple': {
      '1s': 'irai',
      '2s': 'iras',
      '3s': 'ira',
      '1p': 'irons',
      '2p': 'irez',
      '3p': 'iront',
    },
    'conditionnel présent': {
      '1s': 'irais',
      '2s': 'irais',
      '3s': 'irait',
      '1p': 'irions',
      '2p': 'iriez',
      '3p': 'iraient',
    },
  },
  finir: {
    présent: {
      '1s': 'finis',
      '2s': 'finis',
      '3s': 'finit',
      '1p': 'finissons',
      '2p': 'finissez',
      '3p': 'finissent',
    },
    imparfait: {
      '1s': 'finissais',
      '2s': 'finissais',
      '3s': 'finissait',
      '1p': 'finissions',
      '2p': 'finissiez',
      '3p': 'finissaient',
    },
    'futur simple': {
      '1s': 'finirai',
      '2s': 'finiras',
      '3s': 'finira',
      '1p': 'finirons',
      '2p': 'finirez',
      '3p': 'finiront',
    },
    'conditionnel présent': {
      '1s': 'finirais',
      '2s': 'finirais',
      '3s': 'finirait',
      '1p': 'finirions',
      '2p': 'finiriez',
      '3p': 'finiraient',
    },
  },
  aimer: {
    présent: {
      '1s': 'aime',
      '2s': 'aimes',
      '3s': 'aime',
      '1p': 'aimons',
      '2p': 'aimez',
      '3p': 'aiment',
    },
    imparfait: {
      '1s': 'aimais',
      '2s': 'aimais',
      '3s': 'aimait',
      '1p': 'aimions',
      '2p': 'aimiez',
      '3p': 'aimaient',
    },
    'futur simple': {
      '1s': 'aimerai',
      '2s': 'aimeras',
      '3s': 'aimera',
      '1p': 'aimerons',
      '2p': 'aimerez',
      '3p': 'aimeront',
    },
    'conditionnel présent': {
      '1s': 'aimerais',
      '2s': 'aimerais',
      '3s': 'aimerait',
      '1p': 'aimerions',
      '2p': 'aimeriez',
      '3p': 'aimeraient',
    },
  },

  // Placeholders pour faciliter l’ajout (à compléter plus tard si besoin)
  ouvrir: null,
  partir: null,
  tenir: null,
  manger: null,
  commencer: null,
};

const DEFAULT_SETTINGS = {
  verbesActifs: Object.keys(CONJ),
  tempsActifs: TEMPS.slice(),
  questionsParSession: 10,
  mode: 'quiz',
};

// ======= Storage helpers =======
const LS_KEYS = {
  settings: 'verbes_settings_v1',
  progress: 'verbes_progress_v1',
  user: 'verbes_user_v1',
  last: 'verbes_last_session_v1',
};
LS_KEYS.badges = 'verbes_badges_v1';
LS_KEYS.streak = 'verbes_streak_v1';

function getBadges() {
  return loadLS(LS_KEYS.badges, []);
}
function saveBadges(b) {
  saveLS(LS_KEYS.badges, b);
}
function awardBadge(id, label) {
  const b = new Set(getBadges());
  if (!b.has(id)) {
    b.add(id);
    saveBadges([...b]);
  }
}
function renderBadges() {
  const el = document.getElementById('badges');
  const map = {
    perfect: '🎯 10/10',
    streak3: '📆 Série 3 jours',
    ontime: '⚡ Révision à l’heure',
  };
  const have = getBadges();
  el.innerHTML = have.length
    ? have.map((k) => `<li>${map[k] || k}</li>`).join('')
    : '<li>Aucun badge pour le moment</li>';
}

const nowISO = () => new Date().toISOString();
const todayStr = () => new Date().toISOString().slice(0, 10);
const qNext = document.getElementById('qNext');

function loadLS(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
function saveLS(key, obj) {
  localStorage.setItem(key, JSON.stringify(obj));
}

let settings = loadLS(LS_KEYS.settings, DEFAULT_SETTINGS);
let progress = loadLS(LS_KEYS.progress, {});
let user = loadLS(LS_KEYS.user, { pseudo: '', theme: 'sombre', dernierLogin: nowISO() });

// ======= UI Elements =======
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tab-panel');
tabs.forEach((btn) => {
  btn.addEventListener('click', () => {
    tabs.forEach((b) => b.classList.remove('active'));
    panels.forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// User box
document.getElementById('userName').value = user.pseudo || '';
document.getElementById('saveUser').onclick = () => {
  user.pseudo = document.getElementById('userName').value.trim();
  user.dernierLogin = nowISO();
  saveLS(LS_KEYS.user, user);
  alert('Bonjour ' + (user.pseudo || '👋') + ' !');
};

// Réglages
const verbsChecks = document.getElementById('verbsChecks');
const tensesChecks = document.getElementById('tensesChecks');
const qCount = document.getElementById('qCount');

function renderSettings() {
  verbsChecks.innerHTML = '';
  Object.keys(CONJ).forEach((v) => {
    const id = 'vchk_' + v;
    const wrap = document.createElement('label');
    wrap.innerHTML = `<input type="checkbox" id="${id}" ${
      settings.verbesActifs.includes(v) ? 'checked' : ''
    }/> ${v}`;
    verbsChecks.appendChild(wrap);
    document.getElementById(id).onchange = (e) => {
      if (e.target.checked) {
        if (!settings.verbesActifs.includes(v)) settings.verbesActifs.push(v);
      } else {
        settings.verbesActifs = settings.verbesActifs.filter((x) => x !== v);
      }
    };
  });

  tensesChecks.innerHTML = '';
  TEMPS.forEach((t) => {
    const id = 'tchk_' + t;
    const wrap = document.createElement('label');
    wrap.innerHTML = `<input type="checkbox" id="${id}" ${
      settings.tempsActifs.includes(t) ? 'checked' : ''
    }/> ${t}`;
    tensesChecks.appendChild(wrap);
    document.getElementById(id).onchange = (e) => {
      if (e.target.checked) {
        if (!settings.tempsActifs.includes(t)) settings.tempsActifs.push(t);
      } else {
        settings.tempsActifs = settings.tempsActifs.filter((x) => x !== t);
      }
    };
  });

  qCount.value = settings.questionsParSession;
}
renderSettings();

document.getElementById('saveSettings').onclick = () => {
  settings.questionsParSession = Math.max(5, Math.min(20, parseInt(qCount.value || '10', 10)));
  saveLS(LS_KEYS.settings, settings);
  alert('Réglages enregistrés !');
};

document.getElementById('resetProgress').onclick = () => {
  if (confirm('Réinitialiser toute la progression ?')) {
    progress = {};
    saveLS(LS_KEYS.progress, progress);
    updateDashboard();
  }
};

// ======= Adaptation / Progress =======
function keyOf(v, t, pc) {
  // pc: "1s" etc.
  const nb = pc.endsWith('p') ? 'p' : 's';
  const pers = pc[0];
  return `${v}|${t}|${pers}|${nb}`;
}

function getNode(k) {
  if (!progress[k]) {
    progress[k] = { streak: 0, ease: 2.5, interval: 0, due: todayStr(), weight: 2, history: [] };
  }
  return progress[k];
}

function updateOnAnswer(k, ok) {
  const n = getNode(k);
  if (ok) {
    n.streak += 1;
    n.ease = Math.max(1.3, n.ease + 0.1);
    n.interval =
      n.streak === 1 ? 1 : n.streak === 2 ? 3 : Math.max(3, Math.round(n.interval * n.ease));
    n.weight = Math.max(1, Math.round(n.weight * 0.6));
  } else {
    n.streak = 0;
    n.ease = Math.max(1.3, n.ease - 0.2);
    n.interval = 1;
    n.weight = n.weight + 1;
  }
  const due = new Date();
  due.setDate(due.getDate() + n.interval);
  n.due = due.toISOString().slice(0, 10);
  n.history.push({ d: todayStr(), ok });
  progress[k] = n;
  saveLS(LS_KEYS.progress, progress);
}

// Construire pool adaptatif
function buildPool() {
  const pool = [];
  const today = todayStr();
  settings.verbesActifs.forEach((v) => {
    if (!CONJ[v]) return; // skip placeholders
    settings.tempsActifs.forEach((t) => {
      PERSONNES.forEach((p) => {
        const k = keyOf(v, t, p.code);
        const n = getNode(k);
        const due = n.due <= today;
        const baseW = n.weight || 1;
        const w = due ? baseW + 2 : baseW > 2 ? baseW - 1 : 1;
        pool.push({ k, v, t, p, w, due });
      });
    });
  });
  return pool;
}

function weightedPick(items) {
  const sum = items.reduce((s, it) => s + it.w, 0);
  let r = Math.random() * sum;
  for (const it of items) {
    if ((r -= it.w) <= 0) return it;
  }
  return items[items.length - 1];
}

// ======= Dashboard =======
function updateDashboard() {
  const pool = buildPool();
  const today = todayStr();
  const dues = pool.filter((x) => x.due && getNode(x.k).due <= today);
  document.getElementById('dueCount').textContent = dues.length + ' cartes';
  const dueList = document.getElementById('dueList');
  dueList.innerHTML = '';
  dues.slice(0, 10).forEach((x) => {
    const el = document.createElement('div');
    el.textContent = `${x.v} — ${x.t} — ${x.p.label}`;
    dueList.appendChild(el);
  });

  const last = loadLS(LS_KEYS.last, null);
  document.getElementById('lastScore').textContent = last ? `${last.score}/${last.total}` : '—';
  const le = document.getElementById('lastErrors');
  le.innerHTML = '';
  if (last && last.errors?.length) {
    last.errors.slice(0, 5).forEach((e) => {
      const div = document.createElement('div');
      div.textContent = `${e.sujet} ${e.verbe} (${e.temps}) → ${e.correct}`;
      le.appendChild(div);
      renderBadges();
    });
  }
}
updateDashboard();

// ======= Mode Libre =======
const libreVerbe = document.getElementById('libreVerbe');
const libreTemps = document.getElementById('libreTemps');

function fillSelects() {
  libreVerbe.innerHTML = settings.verbesActifs
    .filter((v) => CONJ[v])
    .map((v) => `<option>${v}</option>`)
    .join('');
  libreTemps.innerHTML = settings.tempsActifs.map((t) => `<option>${t}</option>`).join('');
}
fillSelects();

document.getElementById('libreLoad').onclick = () => {
  const v = libreVerbe.value,
    t = libreTemps.value;
  if (!CONJ[v] || !CONJ[v][t]) {
    alert('Verbe/temps non disponible.');
    return;
  }
  document.getElementById('libreGrid').classList.remove('hidden');
  document.querySelectorAll('#libreGrid input').forEach((i) => (i.value = ''));
  document.getElementById('libreFeedback').textContent = '';
  document.getElementById('libreCorrection').innerHTML = '';
};

document.getElementById('libreCheck').onclick = () => {
  const v = libreVerbe.value,
    t = libreTemps.value;
  const feedback = document.getElementById('libreFeedback');
  const corrBox = document.getElementById('libreCorrection');

  const rows = PERSONNES.map((p) => {
    const inp = (document.querySelector(`#libreGrid input[data-p="${p.code}"]`).value || '')
      .trim()
      .toLowerCase();
    const correctVerb = getVerbFormOnly(v, t, p.code);
    const ok = normalize(inp) === normalize(correctVerb);

    // MAJ adaptative (clé habituelle)
    updateOnAnswer(keyOf(v, t, p.code), ok);

    // Pour l’affichage : on continue d’indiquer le sujet dans la colonne "Correction"
    const fullTarget = renderTargetForm(p, v, t); // “je suis”, “tu es”, …

    return { p, inp, correctVerb, fullTarget, ok };
  });

  const okCount = rows.filter((r) => r.ok).length;
  feedback.className = 'feedback ' + (okCount === 6 ? 'ok' : 'ko');
  feedback.textContent = okCount === 6 ? 'Parfait !' : `Réponses correctes : ${okCount}/6`;

  // Important : on surligne l’écart sur le verbe UNIQUEMENT (pas le sujet)
  corrBox.innerHTML = rows
    .map(
      (r) =>
        `<div class="row">
       <span>${r.p.label}</span>
       <span>${highlight(r.inp, r.correctVerb)}</span>
       <span>→ ${r.fullTarget}</span>
     </div>`
    )
    .join('');

  updateDashboard();
};

// ======= Quiz =======
const startQuizBtn = document.getElementById('startQuiz');
const quizBox = document.getElementById('quizBox');
const qInput = document.getElementById('qInput');
const qSubmit = document.getElementById('qSubmit');
const qFeedback = document.getElementById('qFeedback');
const qProgress = document.getElementById('qProgress');
const qSujet = document.getElementById('qSujet');
const qVerbe = document.getElementById('qVerbe');
const qTemps = document.getElementById('qTemps');

let quizState = null;

startQuizBtn.onclick = () => {
  const pool = buildPool().filter((x) => CONJ[x.v] && CONJ[x.v][x.t]);
  if (pool.length === 0) {
    alert('Aucun item disponible. Vérifie les réglages.');
    return;
  }
  const total = Math.max(5, Math.min(20, settings.questionsParSession || 10));
  const hadDue = pool.some((x) => getNode(x.k).due <= todayStr());
  quizState = { total, n: 0, score: 0, items: [], errors: [], hadDueAtStart: hadDue };
  quizBox.classList.remove('hidden');
  nextQuestion(pool);
};

function nextQuestion(pool) {
  quizState.n++;
  if (quizState.n > quizState.total) {
    endQuiz();
    return;
  }
  setProgress((quizState.n - 1) / quizState.total);

  // 70% due, 30% autres “faibles”
  const duePool = pool.filter((x) => getNode(x.k).due <= todayStr());
  const altPool = pool.filter((x) => getNode(x.k).weight >= 3);
  const pickFrom =
    Math.random() < 0.7 && duePool.length ? duePool : altPool.length ? altPool : pool;
  const item = weightedPick(pickFrom);

  quizState.current = item;
  qSujet.textContent = item.p.label;
  qVerbe.textContent = item.v;
  qTemps.textContent = item.t;
  qInput.value = '';
  qFeedback.textContent = '';
  qInput.focus();

  qSubmit.onclick = validateCurrent;
}

function validateCurrent() {
  const it = quizState.current;
  const correct = renderTargetForm(it.p, it.v, it.t);
  const answer = qInput.value.trim().toLowerCase();
  const ok = normalize(answer) === normalize(correct);

  updateOnAnswer(it.k, ok);

  if (ok) {
    qFeedback.className = 'feedback ok';
    qFeedback.textContent = '✔ Bravo !';
    quizState.score++;
    qNext.style.display = 'none';
    setTimeout(() => nextQuestion(buildPool().filter((x) => CONJ[x.v] && CONJ[x.v][x.t])), 600);
  } else {
    qFeedback.className = 'feedback ko';
    qFeedback.innerHTML = `✘ Oups. ${highlight(answer, correct)} → <b>${correct}</b>`;
    quizState.errors.push({
      sujet: it.p.label,
      verbe: it.v,
      temps: it.t,
      correct,
    });
    qNext.style.display = 'inline-block';
  }
  qNext.onclick = () => {
    qNext.style.display = 'none';
    nextQuestion(buildPool().filter((x) => CONJ[x.v] && CONJ[x.v][x.t]));
  };
  saveLS(LS_KEYS.progress, progress);
}

function endQuiz() {
  setProgress(1);
  qFeedback.className = 'feedback';
  qFeedback.innerHTML = `Session terminée — score <b>${quizState.score}/${quizState.total}</b>`;
  saveLS(LS_KEYS.last, {
    score: quizState.score,
    total: quizState.total,
    when: nowISO(),
    errors: quizState.errors,
  });

  // Badge 10/10
  if (quizState.score === quizState.total) {
    awardBadge('perfect');
  }

  // Streak quotidien (jour civil)
  const today = todayStr();
  const streak = loadLS(LS_KEYS.streak, { lastDay: null, count: 0 });
  if (streak.lastDay === today) {
    /* rien */
  } else {
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    const ystr = y.toISOString().slice(0, 10);
    streak.count = streak.lastDay === ystr ? streak.count + 1 : 1;
    streak.lastDay = today;
    saveLS(LS_KEYS.streak, streak);
  }
  if (streak.count >= 3) {
    awardBadge('streak3');
  }

  // Badge “révision à l’heure” si on avait au moins 1 due au démarrage
  if (quizState.hadDueAtStart) {
    awardBadge('ontime');
  }

  updateDashboard();
}

function setProgress(ratio) {
  qProgress.style.setProperty('--w', Math.round(ratio * 100) + '%');
  qProgress.style.background = '';
  qProgress.style.position = 'relative';
  qProgress.innerHTML = '';
  // simple fill via inline style:
  qProgress.style.setProperty(
    'background',
    `linear-gradient(90deg, #34d399 ${Math.round(ratio * 100)}%, transparent 0)`
  );
}

// ======= Utilitaires =======

// helper pour récupérer la forme verbale seule
function getVerbFormOnly(v, t, pCode) {
  return CONJ[v]?.[t]?.[pCode] || '';
}

function renderTargetForm(p, v, t) {
  const sujet = p.sujet;
  const forme = CONJ[v]?.[t]?.[p.code];
  if (!forme) return sujet + ' (?)';

  // je → j’ devant voyelle/’h
  const needsElision = (s) => {
    const c = s[0];
    return 'aeiouyh'.includes(c);
  };

  if (sujet === 'je' && needsElision(forme)) {
    // pas d’espace entre j’ et le verbe
    return `j’${forme}`;
  } else {
    return `${sujet} ${forme}`.trim();
  }
}

function normalize(s) {
  return s
    .replaceAll('’', "'")
    .replace(/\bj\s+(?=[aeiouyh])/g, "j'") // j a... -> j'a...
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// Met en évidence différence simple (longueur/char)
function highlight(given, correct) {
  given = given || '';
  const g = given.split('');
  const c = (correct || '').split('');
  let out = '';
  const len = Math.max(g.length, c.length);
  for (let i = 0; i < len; i++) {
    const a = g[i] ?? '';
    const b = c[i] ?? '';
    if (a === b) out += a;
    else
      out += `<span style="background:#3f1d1d;border-radius:4px;padding:0 2px">${a || '•'}</span>`;
  }
  return out || '—';
}
