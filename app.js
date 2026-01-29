/* ============================================================================
   Verbes — app.js (POC éducatif 10–11 ans)
   - Initialisation robuste (JSON → state → DOM → rendu)
   - Profils par prénom (namespacing localStorage)
   - Adaptation (spaced repetition simplifiée)
   - Quiz, Mode libre, Rapport + Détails
   ============================================================================ */

(() => {
  'use strict';

  /* =========================
   * 0) Constantes & Helpers
   * ========================= */
  const LS_KEYS = {
    settings: 'verbes_settings_v1',
    progress: 'verbes_progress_v1',
    user: 'verbes_user_v1',
    last: 'verbes_last_session_v1',
    history: 'verbes_history_v1',
    badges: 'verbes_badges_v1',
    streak: 'verbes_streak_v1',
  };
  const nowISO = () => new Date().toISOString();
  const todayStr = () => new Date().toISOString().slice(0, 10);
  const $id = (id) => document.getElementById(id);

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

  /* =========================
   * 1) Profils (namespacing LS)
   * ========================= */
  let PROFILE_ID = loadLS('verbes_profile_id_v1', 'default');

  function sanitizeId(name) {
    const s = (name || 'default')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 32);
    return s || 'default';
  }
  function keyWithProfile(base) {
    return `${base}__${PROFILE_ID}`;
  }
  function loadP(base, fallback) {
    return loadLS(keyWithProfile(base), fallback);
  }
  function saveP(base, obj) {
    saveLS(keyWithProfile(base), obj);
  }

  // État de profil (chargé lors d'un switch)
  let settings; // dépend des JSON
  let stagedSettings; // init dans renderSettings()
  const deepClone = (o) => JSON.parse(JSON.stringify(o));
  let progress = {}; // init dans loadProfileState()

  function getDefaultSettings() {
    return {
      verbesActifs: Object.keys(CONJ),
      tempsActifs: TEMPS.slice(),
      questionsParSession: 10,
      mode: 'quiz',
    };
  }
  function loadProfileState() {
    settings = loadP(LS_KEYS.settings, getDefaultSettings());
    progress = loadP(LS_KEYS.progress, {});
    stagedSettings = deepClone(settings);
  }
  function switchProfile(name) {
    PROFILE_ID = sanitizeId(name);
    saveLS('verbes_profile_id_v1', PROFILE_ID);
    loadProfileState(); // recharge settings/progress du profil
    renderSettings(); // nécessite DOM prêt
    fillSelects(); // idem
    updateDashboard(); // idem
  }

  /* =========================
   * 2) Données globales & utilisateur
   * ========================= */
  // Données externes (JSON)
  let PERSONNES = [];
  let TEMPS = [];
  let CONJ = {};
  let PRESETS = [];

  // Données utilisateur simple (prénom)
  let user = loadLS(LS_KEYS.user, { pseudo: '', theme: 'sombre', dernierLogin: nowISO() });

  /* =========================
   * 3) Bootstrap (ordre sûr)
   * ========================= */
  document.addEventListener('DOMContentLoaded', bootstrap);

  async function bootstrap() {
    await initData(); // charge JSON (ou fallback)
    initDOM(); // récupère toutes les refs DOM + events
    loadProfileState(); // crée settings/progress basés sur JSON
    renderSettings(); // premier rendu maintenant que tout est prêt
    fillSelects();
    updateDashboard();
    // démarre sur le profil mémorisé (met juste à jour la vue si pseudo existant)
    if (user.pseudo) switchProfile(user.pseudo);
  }

  async function initData() {
    try {
      const [p, t, c, pr] = await Promise.all([
        fetch('data/personnes.json').then((r) => r.json()),
        fetch('data/temps.json').then((r) => r.json()),
        fetch('data/conj.json').then((r) => r.json()),
        fetch('data/presets.json')
          .then((r) => r.json())
          .catch(() => []),
      ]);
      PERSONNES = p;
      TEMPS = t;
      CONJ = c;
      PRESETS = pr || [];
    } catch (e) {
      console.warn('Chargement JSON échoué, fallback local utilisé.', e);
      PERSONNES = [
        { code: '1s', label: 'je / j’', sujet: 'je' },
        { code: '2s', label: 'tu', sujet: 'tu' },
        { code: '3s', label: 'il/elle', sujet: 'il' },
        { code: '1p', label: 'nous', sujet: 'nous' },
        { code: '2p', label: 'vous', sujet: 'vous' },
        { code: '3p', label: 'ils/elles', sujet: 'ils' },
      ];
      TEMPS = ['présent', 'imparfait', 'futur simple', 'conditionnel présent'];
      CONJ = {
        être: {
          présent: {
            '1s': 'suis',
            '2s': 'es',
            '3s': 'est',
            '1p': 'sommes',
            '2p': 'êtes',
            '3p': 'sont',
          },
        },
        avoir: {
          présent: { '1s': 'ai', '2s': 'as', '3s': 'a', '1p': 'avons', '2p': 'avez', '3p': 'ont' },
        },
        aller: {
          présent: {
            '1s': 'vais',
            '2s': 'vas',
            '3s': 'va',
            '1p': 'allons',
            '2p': 'allez',
            '3p': 'vont',
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
        },
      };
      PRESETS = [
        {
          id: '5e-phase-1',
          label: '5e – Phase 1 (Présent + Imparfait, 10 verbes)',
          verbes: [
            'avoir',
            'être',
            'aimer',
            'aller',
            'finir',
            'commencer',
            'manger',
            'ouvrir',
            'partir',
            'tenir',
          ],
          temps: ['présent', 'imparfait'],
          questionsParSession: 10,
        },
      ];
    }
  }

  /* =========================
   * 4) DOM refs & Events (aucun rendu ici)
   * ========================= */
  let tabs, panels;
  let userNameEl, saveUserBtn;
  let verbsChecks, tensesChecks, qCountEl, saveSettingsBtn, resetProgressBtn;
  let startQuizBtn,
    quizBox,
    qInput,
    qSubmit,
    qNext,
    qFeedback,
    qProgress,
    qSujet,
    qVerbe,
    qTemps,
    qSujetLeft;
  let badgesEl;
  let generatePrintBtn, printBtn, printPreview;
  let libreVerbeSel, libreTempsSel, libreLoadBtn, libreCheckBtn;
  let detailsToggleBound = false;

  function initDOM() {
    // Tabs
    tabs = document.querySelectorAll('.tab');
    panels = document.querySelectorAll('.tab-panel');
    function setActiveTab(btn) {
      tabs.forEach((b) => {
        const isActive = b === btn;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-selected', isActive ? 'true' : 'false');
        b.setAttribute('tabindex', isActive ? '0' : '-1');
      });
      panels.forEach((p) => {
        const isActive = p.id === btn.dataset.tab;
        p.classList.toggle('active', isActive);
        p.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      });
    }
    tabs.forEach((btn) => {
      btn.addEventListener('click', () => {
        setActiveTab(btn);
        if (btn.dataset.tab === 'rapport') {
          renderReport();
          const incZeros = $id('rDetailsAll')?.checked || false;
          renderDetails(incZeros);
          if (!detailsToggleBound) {
            const rDetailsAll = $id('rDetailsAll');
            if (rDetailsAll) {
              rDetailsAll.addEventListener('change', (e) => renderDetails(!!e.target.checked));
              detailsToggleBound = true;
            }
          }
        }
      });
    });
    const initialTab = document.querySelector('.tab.active') || tabs[0];
    if (initialTab) setActiveTab(initialTab);

    // User box
    userNameEl = $id('userName');
    saveUserBtn = $id('saveUser');
    userNameEl.value = user.pseudo || '';
    saveUserBtn.onclick = () => {
      const name = userNameEl.value.trim();
      user.pseudo = name;
      user.dernierLogin = nowISO();
      saveLS(LS_KEYS.user, user);
      switchProfile(name); // charge/affiche ce profil
      alert('Profil chargé pour ' + (name || '👋'));
    };

    // Réglages
    verbsChecks = $id('verbsChecks');
    tensesChecks = $id('tensesChecks');
    qCountEl = $id('qCount');
    saveSettingsBtn = $id('saveSettings');
    resetProgressBtn = $id('resetProgress');

    saveSettingsBtn.onclick = () => {
      stagedSettings.questionsParSession = Math.max(
        5,
        Math.min(20, parseInt(qCountEl.value || '10', 10))
      );
      // commit : staged -> settings
      settings = deepClone(stagedSettings);
      saveP(LS_KEYS.settings, settings);
      stagedSettings = deepClone(settings);
      // rafraîchir les zones qui dépendent des réglages persistés
      fillSelects(); // Mode libre (utilise settings persisté)
      ensureLibreSelectionValid();
      alert('Réglages enregistrés !');
    };
    resetProgressBtn.onclick = () => {
      if (confirm('Réinitialiser toute la progression ?')) {
        progress = {};
        saveP(LS_KEYS.progress, progress);
        updateDashboard();
      }
    };

    // Mode libre
    libreVerbeSel = $id('libreVerbe');
    libreTempsSel = $id('libreTemps');
    libreLoadBtn = $id('libreLoad');
    libreCheckBtn = $id('libreCheck');

    libreLoadBtn.onclick = () => {
      const v = libreVerbeSel.value,
        t = libreTempsSel.value;
      if (!CONJ[v] || !CONJ[v][t]) {
        alert('Verbe/temps non disponible.');
        return;
      }
      $id('libreGrid').classList.remove('hidden');
      document.querySelectorAll('#libreGrid input').forEach((i) => (i.value = ''));
      $id('libreFeedback').textContent = '';
      $id('libreCorrection').innerHTML = '';
    };

    libreCheckBtn.onclick = () => {
      const v = libreVerbeSel.value,
        t = libreTempsSel.value;
      const feedback = $id('libreFeedback');
      const corrBox = $id('libreCorrection');

      const rows = PERSONNES.map((p) => {
        const inp = (document.querySelector(`#libreGrid input[data-p="${p.code}"]`).value || '')
          .trim()
          .toLowerCase();
        const correctVerb = getVerbFormOnly(v, t, p.code);
        const ok = normalize(inp) === normalize(correctVerb);
        updateOnAnswer(keyOf(v, t, p.code), ok);
        const fullTarget = renderTargetForm(p, v, t);
        return { p, inp, correctVerb, fullTarget, ok };
      });

      const okCount = rows.filter((r) => r.ok).length;
      feedback.className = 'feedback ' + (okCount === 6 ? 'ok' : 'ko');
      feedback.textContent = okCount === 6 ? 'Parfait !' : `Réponses correctes : ${okCount}/6`;
      corrBox.innerHTML = rows
        .map(
          (r) =>
            `<div class="row">
           <span>${escapeHTML(r.p.label)}</span>
           <span>${highlight(r.inp, r.correctVerb)}</span>
           <span>→ ${escapeHTML(r.fullTarget)}</span>
         </div>`
        )
        .join('');
      updateDashboard();
    };

    // Quiz
    startQuizBtn = $id('startQuiz');
    quizBox = $id('quizBox');
    qInput = $id('qInput');
    qSubmit = $id('qSubmit');
    qNext = $id('qNext');
    qFeedback = $id('qFeedback');
    qProgress = $id('qProgress');
    qSujet = $id('qSujet');
    qVerbe = $id('qVerbe');
    qTemps = $id('qTemps');
    qSujetLeft = $id('qSujetLeft');
    badgesEl = $id('badges');
    generatePrintBtn = $id('generatePrintQuiz');
    printBtn = $id('printQuiz');
    printPreview = $id('printPreview');

    startQuizBtn.onclick = () => {
      const pool = buildPool().filter((x) => CONJ[x.v] && CONJ[x.v][x.t]);
      if (pool.length === 0) {
        alert(
          'Aucun item disponible. Va dans “Réglages” pour activer au moins 1 verbe et 1 temps.'
        );
        return;
      }
      const total = Math.max(5, Math.min(20, settings.questionsParSession || 10));
      const hadDue = pool.some((x) => x.due);
      if (quizState?.timerId) clearTimeout(quizState.timerId);
      quizState = {
        total,
        n: 0,
        score: 0,
        items: [],
        errors: [],
        hadDueAtStart: hadDue,
        lastKey: null,
        timerId: null,
        finished: false,
      };
      quizBox.classList.remove('hidden');
      startQuizBtn.style.display = 'none';
      qInput.disabled = false;
      qSubmit.disabled = false;
      qNext.style.display = 'none';
      qFeedback.textContent = '';
      nextQuestion(pool);
    };

    qInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        qSubmit.click(); // déclenche validateCurrent()
      }
    });

    // Badges tooltip (tap/click)
    badgesEl?.addEventListener('click', (e) => {
      const btn = e.target.closest('.badge-btn');
      if (!btn) return;
      const li = btn.closest('li');
      const tip = li?.querySelector('.badge-tip');
      if (!tip) return;
      const isOpen = tip.classList.contains('show');
      badgesEl.querySelectorAll('.badge-tip.show').forEach((t) => t.classList.remove('show'));
      badgesEl
        .querySelectorAll('.badge-btn[aria-expanded="true"]')
        .forEach((b) => b.setAttribute('aria-expanded', 'false'));
      if (!isOpen) {
        tip.classList.add('show');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
    document.addEventListener('click', (e) => {
      if (badgesEl && !badgesEl.contains(e.target)) {
        badgesEl.querySelectorAll('.badge-tip.show').forEach((t) => t.classList.remove('show'));
        badgesEl
          .querySelectorAll('.badge-btn[aria-expanded="true"]')
          .forEach((b) => b.setAttribute('aria-expanded', 'false'));
      }
    });

    generatePrintBtn?.addEventListener('click', generatePrintableQuiz);
    printBtn?.addEventListener('click', () => window.print());
  }

  /* =========================
   * 5) Adaptation & Progress
   * ========================= */
  function keyOf(v, t, pc) {
    const nb = pc.endsWith('p') ? 'p' : 's';
    const pers = pc[0];
    return `${v}|${t}|${pers}|${nb}`;
  }
  const DEFAULT_NODE = () => ({
    streak: 0,
    ease: 2.5,
    interval: 0,
    due: todayStr(),
    weight: 2,
    history: [],
  });
  function readNode(k) {
    return progress && progress[k] ? progress[k] : DEFAULT_NODE();
  }
  function ensureNode(k) {
    if (!progress[k]) progress[k] = DEFAULT_NODE();
    return progress[k];
  }

  function updateOnAnswer(k, ok) {
    const n = ensureNode(k);
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
    saveP(LS_KEYS.progress, progress);
  }

  function buildPool() {
    const pool = [];
    const today = todayStr();
    settings.verbesActifs.forEach((v) => {
      if (!CONJ[v]) return;
      settings.tempsActifs.forEach((t) => {
        if (!CONJ[v][t]) return;
        PERSONNES.forEach((p) => {
          const k = keyOf(v, t, p.code);
          const hasNode = !!(progress && progress[k]);
          const n = hasNode ? progress[k] : readNode(k);
          const due = hasNode && n.due <= today;
          const baseW = n.weight || 1;
          const w = hasNode ? (due ? baseW + 2 : baseW > 2 ? baseW - 1 : 1) : 1;
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

  function weightedPickIndex(items) {
    const sum = items.reduce((s, it) => s + it.w, 0);
    let r = Math.random() * sum;
    for (let i = 0; i < items.length; i++) {
      r -= items[i].w;
      if (r <= 0) return i;
    }
    return items.length - 1;
  }

  /* =========================
   * 6) UI — Réglages/Dashboard
   * ========================= */
  function renderSettings() {
    // --- Presets dropdown ---
    const presetSel = document.getElementById('presetSelect');
    if (presetSel) {
      const prevPreset = presetSel.value;
      // options
      presetSel.innerHTML =
        `<option value="">— choisir —</option>` +
        PRESETS.map(
          (p) => `<option value="${escapeHTML(p.id)}">${escapeHTML(p.label)}</option>`
        ).join('');
      if (prevPreset) presetSel.value = prevPreset;
      // onChange : applique à l'APERÇU (stagedSettings), sans sauvegarder
      presetSel.onchange = () => {
        const id = presetSel.value;
        if (!id) return;
        const resolved = resolvePreset(id);
        applyPresetToStaged(resolved);
        // Re-rendre les cases pour refléter l’aperçu
        renderSettings();
      };
    }
    // Verbes
    verbsChecks.innerHTML = '';
    Object.keys(CONJ).forEach((v) => {
      const id = 'vchk_' + v;
      const wrap = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = id;
      input.checked = stagedSettings.verbesActifs.includes(v);
      wrap.appendChild(input);
      wrap.appendChild(document.createTextNode(' ' + v));
      verbsChecks.appendChild(wrap);
      input.onchange = (e) => {
        if (e.target.checked) {
          if (!stagedSettings.verbesActifs.includes(v)) stagedSettings.verbesActifs.push(v);
        } else {
          stagedSettings.verbesActifs = stagedSettings.verbesActifs.filter((x) => x !== v);
        }
      };
    });

    // Temps
    tensesChecks.innerHTML = '';
    TEMPS.forEach((t) => {
      const id = 'tchk_' + t;
      const wrap = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = id;
      input.checked = stagedSettings.tempsActifs.includes(t);
      wrap.appendChild(input);
      wrap.appendChild(document.createTextNode(' ' + t));
      tensesChecks.appendChild(wrap);
      input.onchange = (e) => {
        if (e.target.checked) {
          if (!stagedSettings.tempsActifs.includes(t)) stagedSettings.tempsActifs.push(t);
        } else {
          stagedSettings.tempsActifs = stagedSettings.tempsActifs.filter((x) => x !== t);
        }
      };
    });

    qCountEl.value = stagedSettings.questionsParSession ?? 10;
  }

  function updateDashboard() {
    const pool = buildPool();
    const dues = pool.filter((x) => x.due);

    $id('dueCount').textContent = dues.length + ' cartes';
    const dueList = $id('dueList');
    dueList.innerHTML = '';
    dues.slice(0, 10).forEach((x) => {
      const el = document.createElement('div');
      el.textContent = `${x.v} — ${x.t} — ${x.p.label}`;
      dueList.appendChild(el);
    });

    const last = loadP(LS_KEYS.last, null);
    $id('lastScore').textContent = last ? `${last.score}/${last.total}` : '—';
    const le = $id('lastErrors');
    le.innerHTML = '';
    const history = loadP(LS_KEYS.history, []);
    if (history.length) {
      history.slice(0, 5).forEach((s) => {
        const div = document.createElement('div');
        const date = new Date(s.when);
        const dstr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        const errCount = s.errors?.length || 0;
        div.textContent = `${dstr} — ${s.score}/${s.total} (${errCount} erreur${
          errCount > 1 ? 's' : ''
        })`;
        le.appendChild(div);
      });
    } else {
      le.textContent = 'Aucune session enregistrée.';
    }
    renderBadges();
  }

  // Mode libre — selects filtrés par réglages
  function fillSelects() {
    const prevVerb = libreVerbeSel.value;
    const prevTemps = libreTempsSel.value;
    const verbs = settings.verbesActifs.filter((v) => CONJ[v]);
    const tenses = settings.tempsActifs.slice();

    libreVerbeSel.innerHTML = verbs.map((v) => `<option>${v}</option>`).join('');
    libreTempsSel.innerHTML = tenses.map((t) => `<option>${t}</option>`).join('');

    if (verbs.includes(prevVerb)) libreVerbeSel.value = prevVerb;
    if (tenses.includes(prevTemps)) libreTempsSel.value = prevTemps;

    const none = verbs.length === 0 || tenses.length === 0;
    libreVerbeSel.disabled = verbs.length === 0;
    libreTempsSel.disabled = tenses.length === 0;
    libreLoadBtn.disabled = none;
    if (none) $id('libreGrid').classList.add('hidden');
  }
  function ensureLibreSelectionValid() {
    if (!settings.verbesActifs.includes(libreVerbeSel.value)) {
      libreVerbeSel.value = settings.verbesActifs.find((v) => CONJ[v]) || '';
    }
    if (!settings.tempsActifs.includes(libreTempsSel.value)) {
      libreTempsSel.value = settings.tempsActifs[0] || '';
    }
    if (!libreVerbeSel.value || !libreTempsSel.value) {
      $id('libreGrid').classList.add('hidden');
    }
  }

  /* =========================
   * 7) UI — Quiz
   * ========================= */
  let quizState = null;

  function pickFromPool(pool, excludeKey) {
    if (!excludeKey) return pool;
    const filtered = pool.filter((x) => x.k !== excludeKey);
    return filtered.length ? filtered : pool;
  }

  function nextQuestion(pool, excludeKey = null) {
    if (!quizState || quizState.finished) return;
    if (!pool || pool.length === 0) {
      endQuiz();
      return;
    }
    quizState.n++;
    if (quizState.n > quizState.total) {
      endQuiz();
      return;
    }
    setProgress((quizState.n - 1) / quizState.total);

    const safePool = pickFromPool(pool, excludeKey);
    const item = weightedPick(safePool);

    quizState.current = item;
    quizState.lastKey = item.k;
    qSujet.textContent = item.p.label;
    qVerbe.textContent = item.v;
    qTemps.textContent = item.t;
    qSujetLeft.textContent = masculineSubject(item.p);
    qInput.value = '';
    qFeedback.textContent = '';
    qInput.focus();

    qSubmit.onclick = validateCurrent;
  }

  function validateCurrent() {
    if (!quizState || quizState.finished || !quizState.current) return;
    const it = quizState.current;
    const correctVerb = getVerbFormOnly(it.v, it.t, it.p.code);
    const correctFull = renderTargetForm(it.p, it.v, it.t);
    const answer = qInput.value.trim().toLowerCase();
    const ok = normalize(answer) === normalize(correctVerb);

    updateOnAnswer(it.k, ok);

    if (ok) {
      qFeedback.className = 'feedback ok';
      qFeedback.textContent = '✔ Bravo !';
      quizState.score++;
      qNext.style.display = 'none';
      if (quizState.timerId) clearTimeout(quizState.timerId);
      quizState.timerId = setTimeout(
        () => nextQuestion(buildPool().filter((x) => CONJ[x.v] && CONJ[x.v][x.t])),
        600
      );
    } else {
      qFeedback.className = 'feedback ko';
      qFeedback.innerHTML = `✘ Oups. ${highlight(answer, correctVerb)} → <b>${escapeHTML(
        correctFull
      )}</b>`;
      quizState.errors.push({ sujet: it.p.label, verbe: it.v, temps: it.t, correct: correctFull });
      qNext.style.display = 'inline-block';
      qNext.onclick = () => {
        qNext.style.display = 'none';
        nextQuestion(
          buildPool().filter((x) => CONJ[x.v] && CONJ[x.v][x.t]),
          it.k
        );
      };
    }
    saveP(LS_KEYS.progress, progress);
  }

  function endQuiz() {
    if (!quizState || quizState.finished) return;
    quizState.finished = true;
    if (quizState.timerId) clearTimeout(quizState.timerId);
    setProgress(1);
    qFeedback.className = 'feedback';
    qFeedback.innerHTML = `Session terminée — score <b>${quizState.score}/${quizState.total}</b>`;
    qNext.style.display = 'none';
    qInput.disabled = true;
    qSubmit.disabled = true;
    startQuizBtn.style.display = 'inline-block';
    startQuizBtn.textContent = 'Redémarrer';
    saveP(LS_KEYS.last, {
      score: quizState.score,
      total: quizState.total,
      when: nowISO(),
      errors: quizState.errors,
    });
    const history = loadP(LS_KEYS.history, []);
    history.unshift({
      score: quizState.score,
      total: quizState.total,
      when: nowISO(),
      errors: quizState.errors,
    });
    saveP(LS_KEYS.history, history.slice(0, 20));

    if (quizState.score === quizState.total) awardBadge('perfect');

    const today = todayStr();
    const streak = loadP(LS_KEYS.streak, { lastDay: null, count: 0 });
    if (streak.lastDay !== today) {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      const ystr = y.toISOString().slice(0, 10);
      streak.count = streak.lastDay === ystr ? streak.count + 1 : 1;
      streak.lastDay = today;
      saveP(LS_KEYS.streak, streak);
    }
    if (streak.count >= 3) awardBadge('streak3');
    if (quizState.hadDueAtStart) awardBadge('ontime');

    updateDashboard();
    if ($id('rapport').classList.contains('active')) {
      renderReport();
      const incZeros = $id('rDetailsAll')?.checked || false;
      renderDetails(incZeros);
    }
  }

  function setProgress(ratio) {
    qProgress.style.setProperty('--w', Math.round(ratio * 100) + '%');
    qProgress.style.background = '';
    qProgress.style.position = 'relative';
    qProgress.innerHTML = '';
    qProgress.style.setProperty(
      'background',
      `linear-gradient(90deg, #34d399 ${Math.round(ratio * 100)}%, transparent 0)`
    );
  }

  /* =========================
   * 8) Rapport & Détails
   * ========================= */
  function getBadges() {
    return loadP(LS_KEYS.badges, []);
  }
  function saveBadges(b) {
    saveP(LS_KEYS.badges, b);
  }
  function awardBadge(id) {
    const b = new Set(getBadges());
    if (!b.has(id)) {
      b.add(id);
      saveBadges([...b]);
    }
  }
  function renderBadges() {
    const el = $id('badges');
    const map = {
      perfect: '🎯 10/10',
      streak3: '📆 Série 3 jours',
      ontime: '⚡ Révision à l’heure',
    };
    const tips = {
      perfect: 'Une session parfaite (score maximal).',
      streak3: 'Au moins une session 3 jours d’affilée.',
      ontime: 'Session terminée alors que des cartes étaient dues.',
    };
    const have = getBadges();
    el.innerHTML = have.length
      ? have
          .map(
            (k) =>
              `<li>
                <button class="badge-btn" type="button" aria-expanded="false">${
                  map[k] || k
                }</button>
                <span class="badge-tip" role="status">${escapeHTML(tips[k] || '')}</span>
              </li>`
          )
          .join('')
      : '<li>Aucun badge pour le moment</li>';
  }

  function parseKey(k) {
    const [v, t, p, nb] = k.split('|');
    return { v, t, code: `${p}${nb}` };
  }
  function labelFromCode(code) {
    return PERSONNES.find((x) => x.code === code)?.label || code;
  }

  function attemptsForKey(k, days = null, createIfMissing = false) {
    const n = createIfMissing ? ensureNode(k) : readNode(k);
    const hist = n?.history || [];
    let arr = hist;
    if (days) {
      const cut = new Date();
      cut.setDate(cut.getDate() - days);
      const cs = cut.toISOString().slice(0, 10);
      arr = hist.filter((h) => h.d >= cs);
    }
    const attempts = arr.length;
    const corrects = arr.filter((h) => h.ok).length;
    const errors = attempts - corrects;
    const rate = attempts ? corrects / attempts : null;
    return {
      attempts,
      corrects,
      errors,
      rate,
      streak: n?.streak || 0,
      ease: n?.ease || 2.5,
      interval: n?.interval || 0,
      due: n?.due || todayStr(),
    };
  }
  function enumerateAllActiveKeys() {
    const keys = [];
    settings.verbesActifs.forEach((v) => {
      if (!CONJ[v]) return;
      settings.tempsActifs.forEach((t) => {
        if (!CONJ[v][t]) return;
        PERSONNES.forEach((p) => keys.push(keyOf(v, t, p.code)));
      });
    });
    return keys;
  }
  function rateColor(rate) {
    if (rate === null) return '#334155';
    if (rate < 0.6) return '#f87171';
    if (rate < 0.8) return '#fbbf24';
    return '#22c55e';
  }
  function pct(n) {
    return n == null ? '—' : Math.round(n * 100) + '%';
  }

  function computeAnalytics() {
    const keys = Object.keys(progress || {});
    const today = todayStr();
    let G_attempts = 0,
      G_corrects = 0,
      dueToday = 0;
    const details = [];
    for (const k of keys) {
      const a = attemptsForKey(k);
      const d = parseKey(k);
      G_attempts += a.attempts;
      G_corrects += a.corrects;
      if (a.due <= today) dueToday++;
      details.push({ key: k, ...d, ...a });
    }
    const globalRate = G_attempts ? G_corrects / G_attempts : null;
    const isWeak = (x) => x.attempts >= 3 && (x.rate === null || x.rate < 0.8);
    const isMastered = (x) =>
      x.attempts >= 5 && x.rate !== null && x.rate >= 0.9 && x.streak >= 3 && x.interval >= 3;

    const weaknesses = details
      .filter(isWeak)
      .sort((a, b) => (a.rate ?? 0) - (b.rate ?? 0))
      .slice(0, 10);
    const mastered = details
      .filter(isMastered)
      .sort((a, b) => {
        if (b.streak !== a.streak) return b.streak - a.streak;
        if ((b.rate ?? 0) !== (a.rate ?? 0)) return (b.rate ?? 0) - (a.rate ?? 0);
        return b.attempts - a.attempts;
      })
      .slice(0, 10);

    const perVerb = new Map();
    for (const d of details) {
      if (!perVerb.has(d.v)) perVerb.set(d.v, { verb: d.v, attempts: 0, corrects: 0 });
      const acc = perVerb.get(d.v);
      acc.attempts += d.attempts;
      acc.corrects += d.corrects;
    }
    const byVerb = [...perVerb.values()]
      .map((x) => {
        const rate = x.attempts ? x.corrects / x.attempts : null;
        return { verb: x.verb, attempts: x.attempts, rate };
      })
      .sort((a, b) => (a.rate ?? 0) - (b.rate ?? 0)); // du plus faible au plus fort

    return {
      globalRate,
      attempts: G_attempts,
      corrects: G_corrects,
      dueToday,
      weakCount: details.filter(isWeak).length,
      masteredCount: details.filter(isMastered).length,
      weaknesses,
      mastered,
      byVerb,
    };
  }

  function rowHTML(label, rate, attempts) {
    const safeLabel = escapeHTML(label);
    const w = rate == null ? 0 : Math.max(0, Math.min(100, Math.round(rate * 100)));
    const color = rateColor(rate);
    return `
      <div class="row-line">
        <div><span class="tag">${safeLabel}</span></div>
        <div>${pct(rate)}</div>
        <div class="meter" title="${attempts} essais">
          <span style="width:${w}%;background:${color}"></span>
        </div>
        <div>${attempts} ess.</div>
      </div>`;
  }
  function rowDetailHTML(label, succ, fail, attempts, rate) {
    const safeLabel = escapeHTML(label);
    const w = rate == null ? 0 : Math.max(0, Math.min(100, Math.round(rate * 100)));
    const color = rateColor(rate);
    return `
      <div class="row-detail">
        <div><span class="tag">${safeLabel}</span></div>
        <div class="count-ok">${succ}</div>
        <div class="count-ko">${fail}</div>
        <div>${attempts}</div>
        <div class="meter" title="${attempts} essais">
          <span style="width:${w}%;background:${color}"></span>
        </div>
        <div>${pct(rate)}</div>
      </div>`;
  }

  function renderReport() {
    const a = computeAnalytics();
    $id('rGlobalRate').textContent = pct(a.globalRate);
    $id('rGlobalAttempts').textContent = `${a.attempts} essais`;
    $id('rMasteredCount').textContent = a.masteredCount;
    $id('rMasteredHint').textContent = '≥90% de réussite, streak ≥3, intervalle ≥3';
    $id('rWeakCount').textContent = a.weakCount;
    $id('rWeakHint').textContent = '≥3 essais et <80%';
    $id('rDueToday').textContent = a.dueToday;

    const weakEl = $id('rWeak');
    weakEl.innerHTML = a.weaknesses.length
      ? a.weaknesses
          .map((x) => rowHTML(`${x.v} — ${x.t} — ${labelFromCode(x.code)}`, x.rate, x.attempts))
          .join('')
      : `<div class="row-line"><div>Aucune faiblesse détectée 🎉</div></div>`;

    const mastEl = $id('rMastered');
    mastEl.innerHTML = a.mastered.length
      ? a.mastered
          .map((x) => rowHTML(`${x.v} — ${x.t} — ${labelFromCode(x.code)}`, x.rate, x.attempts))
          .join('')
      : [
          '<div class="row-line"><div>',
          'Pas encore de cartes “maîtrisées” — ça s’en vient !',
          '</div></div>',
        ].join('');

    const ovEl = $id('rOverview');
    const anyVerbData = a.byVerb.some((v) => v.attempts > 0);
    ovEl.innerHTML = anyVerbData
      ? a.byVerb.map((v) => rowHTML(v.verb, v.rate, v.attempts)).join('')
      : [
          '<div class="row-line"><div>',
          'Aucune donnée — lance un quiz pour remplir le rapport.',
          '</div></div>',
        ].join('');
  }

  function renderDetails(includeZeros) {
    const keys = includeZeros ? enumerateAllActiveKeys() : Object.keys(progress || {});
    const rows = keys.map((k) => {
      const a = attemptsForKey(k, null, /*createIfMissing*/ false);
      const d = parseKey(k);
      const label = `${d.v} — ${d.t} — ${labelFromCode(d.code)}`;
      return { label, ...a, key: k };
    });

    rows.sort((x, y) => {
      if (y.errors !== x.errors) return y.errors - x.errors;
      if (y.attempts !== x.attempts) return y.attempts - x.attempts;
      return x.label.localeCompare(y.label, 'fr');
    });

    const root = $id('rDetails');
    if (!rows.length) {
      root.innerHTML = `<div class="row-detail"><div>Aucune donnée à afficher.</div></div>`;
      return;
    }
    root.innerHTML = rows
      .map((r) => rowDetailHTML(r.label, r.corrects, r.errors, r.attempts, r.rate))
      .join('');
  }

  /* =========================
   * 9) Conjugaison & Utils
   * ========================= */

  function resolvePreset(id) {
    const byId = Object.fromEntries(PRESETS.map((p) => [p.id, p]));
    const seen = new Set();
    function rec(curId) {
      if (!curId || !byId[curId]) {
        return { verbes: [], temps: [], questionsParSession: 10 };
      }
      if (seen.has(curId)) {
        // éviter cycles
        return { verbes: [], temps: [], questionsParSession: 10 };
      }
      seen.add(curId);
      const p = byId[curId];
      const base = p.extends ? rec(p.extends) : { verbes: [], temps: [], questionsParSession: 10 };
      let verbes = (p.verbes ?? base.verbes).slice();
      let temps = (p.temps ?? base.temps).slice();
      if (p.add_verbes) verbes = Array.from(new Set([...base.verbes, ...p.add_verbes]));
      if (p.add_temps) temps = Array.from(new Set([...base.temps, ...p.add_temps]));
      const qps = p.questionsParSession ?? base.questionsParSession ?? 10;
      return { verbes, temps, questionsParSession: qps };
    }
    const merged = rec(id);
    // filtre contre le dataset courant (au cas où preset > données)
    merged.verbes = merged.verbes.filter((v) => CONJ[v]);
    merged.temps = merged.temps.filter((t) => TEMPS.includes(t));
    return merged;
  }

  function applyPresetToStaged(preset) {
    stagedSettings.verbesActifs = preset.verbes.slice();
    stagedSettings.tempsActifs = preset.temps.slice();
    stagedSettings.questionsParSession =
      preset.questionsParSession ?? (stagedSettings.questionsParSession || 10);
  }

  function getVerbFormOnly(v, t, pCode) {
    return CONJ[v]?.[t]?.[pCode] || '';
  }

  function renderTargetForm(p, v, t) {
    const sujet = p.sujet;
    const forme = CONJ[v]?.[t]?.[p.code];
    if (!forme) return sujet + ' (?)';
    const needsElision = (s) => 'aeiouyh'.includes(s[0]);
    if (sujet === 'je' && needsElision(forme)) {
      return `j’${forme}`;
    }
    return `${sujet} ${forme}`.trim();
  }

  function masculineSubject(p) {
    if (p.code === '3s') return 'il';
    if (p.code === '3p') return 'ils';
    return p.sujet || '';
  }

  function generatePrintableQuiz() {
    if (!printPreview) return;
    const pool = buildPool().filter((x) => CONJ[x.v] && CONJ[x.v][x.t]);
    if (!pool.length) {
      printPreview.innerHTML =
        '<div class="print-page"><h3>Feuille d’exercices</h3><p>Aucun item disponible. Active des verbes et des temps dans Réglages.</p></div>';
      return;
    }

    const count = 10;
    const available = pool.slice();
    const items = [];
    for (let i = 0; i < count; i++) {
      if (!available.length) available.push(...pool);
      const idx = weightedPickIndex(available);
      const it = available.splice(idx, 1)[0];
      items.push(it);
    }

    const today = new Date().toLocaleDateString('fr-FR');
    const header = `
      <div class="print-meta">Nom : ____________________________________________  Date : ${today}</div>
      <div class="print-meta">Consigne : complète chaque verbe au temps indiqué.</div>
    `;

    const questions = items
      .map(
        (it, i) => `
        <div class="print-row">
          <div>${i + 1}.</div>
          <div>
            <div><b>${escapeHTML(it.v)}</b> — ${escapeHTML(it.t)}</div>
            <div class="print-subject">Sujet : ${escapeHTML(masculineSubject(it.p))}</div>
          </div>
          <div class="print-blank"></div>
        </div>`
      )
      .join('');

    const answers = items
      .map(
        (it, i) => `
        <div class="print-row">
          <div>${i + 1}.</div>
          <div>
            <div><b>${escapeHTML(it.v)}</b> — ${escapeHTML(it.t)}</div>
            <div class="print-subject">Sujet : ${escapeHTML(masculineSubject(it.p))}</div>
          </div>
          <div class="print-answer">${escapeHTML(renderTargetForm(it.p, it.v, it.t))}</div>
        </div>`
      )
      .join('');

    printPreview.innerHTML = `
      <div class="print-page">
        <h3>Verbes — Feuille d’exercices</h3>
        ${header}
        <div class="print-list">${questions}</div>
      </div>
      <div class="print-page">
        <h3>Verbes — Réponses</h3>
        ${header}
        <div class="print-list">${answers}</div>
      </div>
    `;
  }

  function normalize(s) {
    return s
      .replaceAll('’', "'")
      .replace(/\bj\s+(?=[aeiouyh])/g, "j'") // j a... -> j'a...
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  const ESCAPE_HTML_RE = /[&<>"']/g;
  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(ESCAPE_HTML_RE, (ch) => {
      switch (ch) {
        case '&':
          return '&amp;';
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case '"':
          return '&quot;';
        case "'":
          return '&#39;';
        default:
          return ch;
      }
    });
  }

  function highlight(given, correct) {
    given = given || '';
    const g = given.split('');
    const c = (correct || '').split('');
    let out = '';
    const len = Math.max(g.length, c.length);
    for (let i = 0; i < len; i++) {
      const a = g[i] ?? '';
      const b = c[i] ?? '';
      out +=
        a === b
          ? escapeHTML(a)
          : `<span style="background:#3f1d1d;border-radius:4px;padding:0 2px">${escapeHTML(
              a || '•'
            )}</span>`;
    }
    return out || '—';
  }
})();
