/**
 * FiSi Dualmaster - Anwendungslogik & Didaktischer Trainer
 * Entwickelt für Fachinformatiker für Systemintegration
 * Module: Dezimal, Dual (Binär), Hexadezimal, Subnetting & Prüfungs-Sprint
 */

// ==========================================================================
// 1. SOUND & AUDIO FEEDBACK (Web Audio API)
// ==========================================================================
class SoundEffects {
  constructor() {
    this.audioCtx = null;
    this.enabled = localStorage.getItem('fisi_sound') !== 'false';
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('fisi_sound', this.enabled);
    return this.enabled;
  }

  playClick() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.04);
    } catch (e) {
      console.warn('Audio error', e);
    }
  }

  playSuccess() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      [523.25, 783.99].forEach((freq, i) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gain.gain.setValueAtTime(0.12, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.25);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.25);
      });
    } catch (e) {
      console.warn('Audio error', e);
    }
  }

  playError() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.2);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {
      console.warn('Audio error', e);
    }
  }
}

const sounds = new SoundEffects();

// ==========================================================================
// 2. RECHENWEG-GENERATOREN & HILFSFUNKTIONEN
// ==========================================================================
const ConversionUtils = {
  hexChars: ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'],

  // Stellenwertmethode für beliebige Zahlen (Basis 2)
  getStellenwertSteps(decimalNumber, bitCount = 8) {
    const steps = [];
    let remainder = decimalNumber;
    
    let power = bitCount - 1;
    while ((1 << power) <= decimalNumber && power < 31) {
      power++;
    }
    const maxPower = Math.max(bitCount - 1, power);
    
    for (let p = maxPower; p >= 0; p--) {
      const val = Math.pow(2, p);
      const fits = remainder >= val;
      const bit = fits ? 1 : 0;
      const prevRemainder = remainder;
      if (fits) {
        remainder -= val;
      }
      steps.push({
        power: p,
        val: val,
        fits: fits,
        bit: bit,
        prevRemainder: prevRemainder,
        newRemainder: remainder
      });
    }
    return steps;
  },

  // Divisionsmethode (Basis 2 mit Rest)
  getDivisionSteps(decimalNumber) {
    if (decimalNumber === 0) {
      return [{ quotient: 0, remainder: 0, divResult: 0, original: 0 }];
    }
    const steps = [];
    let current = decimalNumber;
    while (current > 0) {
      const divResult = Math.floor(current / 2);
      const rem = current % 2;
      steps.push({
        original: current,
        divResult: divResult,
        remainder: rem
      });
      current = divResult;
    }
    return steps;
  },

  // Divisionsmethode für Hexadezimal (Basis 16 mit Rest)
  getHexDivisionSteps(decimalNumber) {
    if (decimalNumber === 0) {
      return [{ original: 0, divResult: 0, remainder: 0, hexChar: '0' }];
    }
    const steps = [];
    let current = decimalNumber;
    while (current > 0) {
      const divResult = Math.floor(current / 16);
      const rem = current % 16;
      steps.push({
        original: current,
        divResult: divResult,
        remainder: rem,
        hexChar: this.hexChars[rem]
      });
      current = divResult;
    }
    return steps;
  },

  // Zerlegung in 4-Bit Nibbles mit Hex-Mapping
  getNibbleBreakdown(decimalNumber, padBits = 8) {
    const binStr = decimalNumber.toString(2);
    // Auf Vielfaches von 4 aufrunden
    const targetLen = Math.max(padBits, Math.ceil(binStr.length / 4) * 4);
    const padded = binStr.padStart(targetLen, '0');

    const nibbles = [];
    for (let i = 0; i < padded.length; i += 4) {
      const chunk = padded.slice(i, i + 4);
      const decVal = parseInt(chunk, 2);
      const hexChar = this.hexChars[decVal];
      nibbles.push({
        bits: chunk,
        decVal: decVal,
        hexChar: hexChar
      });
    }
    return nibbles;
  },

  // Binärzahl formatiert mit 4er-Gruppen (Nibbles)
  formatBinary(binStr, padBits = 8) {
    const targetLen = Math.max(padBits, Math.ceil(binStr.length / 4) * 4);
    const padded = binStr.padStart(targetLen, '0');
    const chunks = [];
    for (let i = 0; i < padded.length; i += 4) {
      chunks.push(padded.slice(i, i + 4));
    }
    return chunks.join(' ');
  },

  // Hexadezimal-String säubern (ohne 0x, führende Leerzeichen etc.)
  cleanHex(hexStr) {
    return hexStr.trim().replace(/^0x/i, '').toUpperCase();
  },

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};

// ==========================================================================
// 3. STATISTIKEN & PERSISTENZ (LocalStorage)
// ==========================================================================
class StatsManager {
  constructor(key) {
    this.key = `fisi_stats_${key}`;
    this.data = this.load();
  }

  load() {
    const raw = localStorage.getItem(this.key);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { }
    }
    return { correct: 0, total: 0, streak: 0, maxStreak: 0 };
  }

  save() {
    localStorage.setItem(this.key, JSON.stringify(this.data));
  }

  recordAnswer(isCorrect) {
    this.data.total++;
    if (isCorrect) {
      this.data.correct++;
      this.data.streak++;
      if (this.data.streak > this.data.maxStreak) {
        this.data.maxStreak = this.data.streak;
      }
    } else {
      this.data.streak = 0;
    }
    this.save();
    return this.data;
  }
}

// ==========================================================================
// 4. HAUPT-CONTROLLER & INTERFACE LOGIK
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Theme Setup
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const savedTheme = localStorage.getItem('fisi_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('fisi_theme', next);
    themeIcon.textContent = next === 'dark' ? '☀️' : '🌙';
  });

  // Sound Toggle
  const soundToggle = document.getElementById('soundToggle');
  const soundIcon = document.getElementById('soundIcon');
  soundIcon.textContent = sounds.enabled ? '🔊' : '🔇';
  soundToggle.addEventListener('click', () => {
    const enabled = sounds.toggle();
    soundIcon.textContent = enabled ? '🔊' : '🔇';
  });

  // Reference Table Toggles
  const toggleRefDetails = document.getElementById('toggleRefDetails');
  const hiddenRows = document.querySelectorAll('.details-hidden');
  let refExpanded = false;
  toggleRefDetails.addEventListener('click', () => {
    refExpanded = !refExpanded;
    hiddenRows.forEach(row => {
      row.style.display = refExpanded ? 'table-row' : 'none';
    });
    toggleRefDetails.textContent = refExpanded ? 'Subnetz-Details ausblenden' : 'Subnetz-Details einblenden';
    toggleRefDetails.setAttribute('aria-expanded', refExpanded);
  });

  // Nibble Reference Table Toggle
  const toggleNibbleDetails = document.getElementById('toggleNibbleDetails');
  const nibbleReferenceCard = document.getElementById('nibbleReferenceCard');
  let nibbleExpanded = false;
  toggleNibbleDetails.addEventListener('click', () => {
    nibbleExpanded = !nibbleExpanded;
    nibbleReferenceCard.classList.toggle('hidden', !nibbleExpanded);
    toggleNibbleDetails.textContent = nibbleExpanded ? 'Nibbles verbergen' : 'Nibble-/Hex-Tabelle';
    toggleNibbleDetails.setAttribute('aria-expanded', nibbleExpanded);
  });

  // Navigation Tabs
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabPanels = document.querySelectorAll('.tab-panel');

  function switchTab(targetTabId) {
    navTabs.forEach(tab => {
      const isActive = tab.getAttribute('data-tab') === targetTabId;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive);
    });
    tabPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === targetTabId);
    });

    if (targetTabId === 'tab-dec2bin' && !dec2bin.currentQuestion) dec2bin.newQuestion();
    if (targetTabId === 'tab-bin2dec' && !bin2dec.currentQuestion) bin2dec.newQuestion();
    if (targetTabId === 'tab-hex' && !hexTrainer.currentQuestion) hexTrainer.newQuestion();
    if (targetTabId === 'tab-fisi' && !fisiTrainer.currentQuestion) fisiTrainer.newQuestion();
  }

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.getAttribute('data-tab')));
  });

  // ==========================================================================
  // MODUL 1: DEZIMAL ➔ BINÄR
  // ==========================================================================
  const dec2bin = {
    bitWidth: 8,
    targetNumber: 0,
    currentQuestion: null,
    bitValues: [],
    stats: new StatsManager('dec2bin'),
    inputMode: 'switches',

    dom: {
      targetNumber: document.getElementById('dec2binTargetNumber'),
      bitHint: document.getElementById('dec2binBitHint'),
      modeSwitches: document.getElementById('modeSwitches'),
      modeText: document.getElementById('modeText'),
      switchView: document.getElementById('dec2binSwitchView'),
      textView: document.getElementById('dec2binTextView'),
      bitsBoard: document.getElementById('dec2binBitsBoard'),
      liveSum: document.getElementById('dec2binLiveSum'),
      textInput: document.getElementById('dec2binTextInput'),
      clearInput: document.getElementById('dec2binClearInput'),
      checkBtn: document.getElementById('dec2binCheckBtn'),
      nextBtn: document.getElementById('dec2binNextBtn'),
      solveBtn: document.getElementById('dec2binSolveBtn'),
      feedback: document.getElementById('dec2binFeedback'),
      solution: document.getElementById('dec2binSolution'),
      correctCount: document.getElementById('dec2binCorrectCount'),
      totalCount: document.getElementById('dec2binTotalCount'),
      streak: document.getElementById('dec2binStreak'),
      chipBtns: document.querySelectorAll('.chip-btn[data-target="dec2bin"]')
    },

    init() {
      this.dom.chipBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          this.dom.chipBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.bitWidth = parseInt(btn.getAttribute('data-bits'), 10);
          this.newQuestion();
        });
      });

      this.dom.modeSwitches.addEventListener('change', () => this.setInputMode('switches'));
      this.dom.modeText.addEventListener('change', () => this.setInputMode('text'));

      this.dom.checkBtn.addEventListener('click', () => this.checkAnswer());
      this.dom.nextBtn.addEventListener('click', () => this.newQuestion());
      this.dom.solveBtn.addEventListener('click', () => this.toggleSolution());
      this.dom.clearInput.addEventListener('click', () => {
        this.dom.textInput.value = '';
        this.dom.textInput.focus();
      });

      this.dom.textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.checkAnswer();
      });

      this.updateStatsUI();
      this.newQuestion();
    },

    setInputMode(mode) {
      this.inputMode = mode;
      if (mode === 'switches') {
        this.dom.switchView.classList.remove('hidden');
        this.dom.textView.classList.add('hidden');
      } else {
        this.dom.switchView.classList.add('hidden');
        this.dom.textView.classList.remove('hidden');
        this.dom.textInput.focus();
      }
    },

    newQuestion() {
      const maxVal = Math.pow(2, this.bitWidth) - 1;
      this.targetNumber = ConversionUtils.getRandomInt(1, maxVal);
      this.currentQuestion = this.targetNumber;

      this.dom.targetNumber.textContent = this.targetNumber;
      this.dom.bitHint.textContent = `(${this.bitWidth}-Bit Darstellung: 0 bis ${maxVal})`;

      this.dom.feedback.className = 'feedback-box hidden';
      this.dom.feedback.innerHTML = '';
      this.dom.solution.classList.add('hidden');
      this.dom.solution.innerHTML = '';
      this.dom.solveBtn.textContent = 'Lösungsweg anzeigen';

      this.bitValues = new Array(this.bitWidth).fill(0);
      this.renderBitsBoard();
      this.updateLiveSum();

      this.dom.textInput.value = '';
      if (this.inputMode === 'text') this.dom.textInput.focus();
    },

    renderBitsBoard() {
      this.dom.bitsBoard.innerHTML = '';
      for (let i = this.bitWidth - 1; i >= 0; i--) {
        const powerVal = Math.pow(2, i);
        const unit = document.createElement('div');
        unit.className = 'bit-unit';
        if (this.bitValues[i] === 1) unit.classList.add('active');

        const powerTag = document.createElement('span');
        powerTag.className = 'bit-power-tag';
        powerTag.textContent = `2${this.getSuperscript(i)}`;

        const btn = document.createElement('button');
        btn.className = `bit-btn ${this.bitValues[i] === 1 ? 'active' : ''}`;
        btn.textContent = this.bitValues[i];
        btn.setAttribute('aria-label', `Bit Wertigkeit ${powerVal}`);
        
        btn.addEventListener('click', () => {
          sounds.playClick();
          this.bitValues[i] = this.bitValues[i] === 1 ? 0 : 1;
          btn.textContent = this.bitValues[i];
          btn.classList.toggle('active', this.bitValues[i] === 1);
          unit.classList.toggle('active', this.bitValues[i] === 1);
          this.updateLiveSum();
        });

        const valLabel = document.createElement('span');
        valLabel.className = 'bit-val-label';
        valLabel.textContent = powerVal;

        unit.appendChild(powerTag);
        unit.appendChild(btn);
        unit.appendChild(valLabel);

        this.dom.bitsBoard.appendChild(unit);

        if (i > 0 && i % 4 === 0) {
          const divider = document.createElement('div');
          divider.className = 'nibble-divider';
          this.dom.bitsBoard.appendChild(divider);
        }
      }
    },

    getSuperscript(num) {
      const superscripts = {
        '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
        '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
      };
      return String(num).split('').map(d => superscripts[d] || d).join('');
    },

    updateLiveSum() {
      let sum = 0;
      for (let i = 0; i < this.bitWidth; i++) {
        if (this.bitValues[i] === 1) sum += Math.pow(2, i);
      }
      this.dom.liveSum.textContent = sum;
      return sum;
    },

    getUserBinaryString() {
      if (this.inputMode === 'switches') {
        let str = '';
        for (let i = this.bitWidth - 1; i >= 0; i--) {
          str += this.bitValues[i];
        }
        return str;
      } else {
        return this.dom.textInput.value.trim().replace(/\s+/g, '');
      }
    },

    checkAnswer() {
      const userBinStr = this.getUserBinaryString();
      if (!userBinStr || !/^[01]+$/.test(userBinStr)) {
        this.showFeedback(false, 'Bitte gib eine gültige Binärzahl ein (nur Nullen und Einsen).');
        sounds.playError();
        return;
      }

      const userDecimal = parseInt(userBinStr, 2);
      const isCorrect = userDecimal === this.targetNumber;

      if (isCorrect) {
        sounds.playSuccess();
        this.showFeedback(true, `Hervorragend! ${this.targetNumber} entspricht exakt binär <strong>${ConversionUtils.formatBinary(this.targetNumber.toString(2), this.bitWidth)}</strong>.`);
      } else {
        sounds.playError();
        const diff = userDecimal - this.targetNumber;
        const diffStr = diff > 0 ? `+${diff} zu viel` : `${diff} zu wenig`;
        this.showFeedback(false, `Noch nicht ganz: Deine Eingabe entspricht dezimal <strong>${userDecimal}</strong> (${diffStr}). Gesucht war <strong>${this.targetNumber}</strong>.`);
      }

      this.stats.recordAnswer(isCorrect);
      this.updateStatsUI();
    },

    showFeedback(isCorrect, message) {
      this.dom.feedback.className = `feedback-box ${isCorrect ? 'success' : 'error'}`;
      this.dom.feedback.innerHTML = `
        <div class="feedback-title">${isCorrect ? '✅ Richtig gelöst!' : '❌ Nicht ganz richtig'}</div>
        <p>${message}</p>
      `;
      this.dom.feedback.classList.remove('hidden');
    },

    toggleSolution() {
      if (!this.dom.solution.classList.contains('hidden')) {
        this.dom.solution.classList.add('hidden');
        this.dom.solveBtn.textContent = 'Lösungsweg anzeigen';
        return;
      }

      const steps = ConversionUtils.getStellenwertSteps(this.targetNumber, this.bitWidth);
      const binTarget = this.targetNumber.toString(2).padStart(this.bitWidth, '0');

      let html = `<h4>Lösungsweg mit der Stellenwertmethode:</h4>`;
      html += `<ul class="solution-steps">`;
      steps.forEach(s => {
        if (s.fits) {
          html += `<li>2<sup>${s.power}</sup> = <strong>${s.val}</strong> passt in ${s.prevRemainder} ➔ <strong>Bit = 1</strong> (Neuer Rest: ${s.prevRemainder} - ${s.val} = <strong>${s.newRemainder}</strong>)</li>`;
        } else {
          html += `<li style="opacity:0.65;">2<sup>${s.power}</sup> = ${s.val} ist größer als ${s.prevRemainder} ➔ Bit = 0 (Rest bleibt ${s.newRemainder})</li>`;
        }
      });
      html += `</ul>`;
      html += `<div style="margin-top:0.8rem; font-weight:700;">Ergebnis: <span style="font-family:var(--font-mono); color:var(--primary); font-size:1.1rem;">${ConversionUtils.formatBinary(binTarget, this.bitWidth)}</span></div>`;

      this.dom.solution.innerHTML = html;
      this.dom.solution.classList.remove('hidden');
      this.dom.solveBtn.textContent = 'Lösungsweg verbergen';
    },

    updateStatsUI() {
      this.dom.correctCount.textContent = this.stats.data.correct;
      this.dom.totalCount.textContent = this.stats.data.total;
      this.dom.streak.textContent = this.stats.data.streak;
    }
  };

  // ==========================================================================
  // MODUL 2: BINÄR ➔ DEZIMAL
  // ==========================================================================
  const bin2dec = {
    bitWidth: 8,
    targetNumber: 0,
    targetBinary: '',
    currentQuestion: null,
    stats: new StatsManager('bin2dec'),
    showPowersHelper: false,

    dom: {
      binaryWrapper: document.getElementById('bin2decTargetBinaryWrapper'),
      helperCheckbox: document.getElementById('bin2decShowPowersHelper'),
      input: document.getElementById('bin2decInput'),
      checkBtn: document.getElementById('bin2decCheckBtn'),
      nextBtn: document.getElementById('bin2decNextBtn'),
      solveBtn: document.getElementById('bin2decSolveBtn'),
      feedback: document.getElementById('bin2decFeedback'),
      solution: document.getElementById('bin2decSolution'),
      correctCount: document.getElementById('bin2decCorrectCount'),
      totalCount: document.getElementById('bin2decTotalCount'),
      streak: document.getElementById('bin2decStreak'),
      chipBtns: document.querySelectorAll('.chip-btn[data-target="bin2dec"]')
    },

    init() {
      this.dom.chipBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          this.dom.chipBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.bitWidth = parseInt(btn.getAttribute('data-bits'), 10);
          this.newQuestion();
        });
      });

      this.dom.helperCheckbox.addEventListener('change', (e) => {
        this.showPowersHelper = e.target.checked;
        this.renderBinaryDisplay();
      });

      this.dom.checkBtn.addEventListener('click', () => this.checkAnswer());
      this.dom.nextBtn.addEventListener('click', () => this.newQuestion());
      this.dom.solveBtn.addEventListener('click', () => this.toggleSolution());

      this.dom.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.checkAnswer();
      });

      this.updateStatsUI();
      this.newQuestion();
    },

    newQuestion() {
      const maxVal = Math.pow(2, this.bitWidth) - 1;
      this.targetNumber = ConversionUtils.getRandomInt(1, maxVal);
      this.targetBinary = this.targetNumber.toString(2).padStart(this.bitWidth, '0');
      this.currentQuestion = this.targetNumber;

      this.renderBinaryDisplay();

      this.dom.input.value = '';
      this.dom.feedback.className = 'feedback-box hidden';
      this.dom.feedback.innerHTML = '';
      this.dom.solution.classList.add('hidden');
      this.dom.solution.innerHTML = '';
      this.dom.solveBtn.textContent = 'Lösungsweg aufschlüsseln';
      this.dom.input.focus();
    },

    renderBinaryDisplay() {
      this.dom.binaryWrapper.innerHTML = '';
      const len = this.targetBinary.length;

      for (let i = 0; i < len; i++) {
        const char = this.targetBinary[i];
        const power = len - 1 - i;
        const powerVal = Math.pow(2, power);

        const box = document.createElement('div');
        box.className = 'bin-char-box';

        if (this.showPowersHelper) {
          const powerSpan = document.createElement('span');
          powerSpan.className = 'bin-char-power';
          powerSpan.textContent = powerVal;
          box.appendChild(powerSpan);
        }

        const charVal = document.createElement('div');
        charVal.className = `bin-char-val ${char === '1' ? 'is-one' : 'is-zero'}`;
        charVal.textContent = char;
        box.appendChild(charVal);

        this.dom.binaryWrapper.appendChild(box);

        if ((i + 1) % 4 === 0 && (i + 1) < len) {
          const gap = document.createElement('div');
          gap.className = 'bin-gap';
          this.dom.binaryWrapper.appendChild(gap);
        }
      }
    },

    checkAnswer() {
      const valStr = this.dom.input.value.trim();
      if (!valStr || isNaN(valStr)) {
        this.showFeedback(false, 'Bitte gib eine gültige Dezimalzahl ein.');
        sounds.playError();
        return;
      }

      const userVal = parseInt(valStr, 10);
      const isCorrect = userVal === this.targetNumber;

      if (isCorrect) {
        sounds.playSuccess();
        this.showFeedback(true, `Exzellent! ${this.targetBinary}₂ ergibt dezimal genau <strong>${this.targetNumber}</strong>.`);
      } else {
        sounds.playError();
        const diff = userVal - this.targetNumber;
        const diffStr = diff > 0 ? `+${diff} zu viel` : `${diff} zu wenig`;
        this.showFeedback(false, `Falsch: Dein Ergebnis ist <strong>${userVal}</strong> (${diffStr}). Die richtige Antwort lautet <strong>${this.targetNumber}</strong>.`);
      }

      this.stats.recordAnswer(isCorrect);
      this.updateStatsUI();
    },

    showFeedback(isCorrect, message) {
      this.dom.feedback.className = `feedback-box ${isCorrect ? 'success' : 'error'}`;
      this.dom.feedback.innerHTML = `
        <div class="feedback-title">${isCorrect ? '✅ Richtig!' : '❌ Fehler'}</div>
        <p>${message}</p>
      `;
      this.dom.feedback.classList.remove('hidden');
    },

    toggleSolution() {
      if (!this.dom.solution.classList.contains('hidden')) {
        this.dom.solution.classList.add('hidden');
        this.dom.solveBtn.textContent = 'Lösungsweg aufschlüsseln';
        return;
      }

      const len = this.targetBinary.length;
      const terms = [];
      for (let i = 0; i < len; i++) {
        if (this.targetBinary[i] === '1') {
          const p = len - 1 - i;
          const val = Math.pow(2, p);
          terms.push(`2<sup>${p}</sup> (${val})`);
        }
      }

      let html = `<h4>Lösungsweg: Aufsummieren aller 1-Bits:</h4>`;
      html += `<div style="background:var(--bg-surface); padding:0.75rem; border-radius:var(--radius-sm); font-family:var(--font-mono); margin-bottom:0.6rem;">`;
      html += `${terms.join(' + ')} = <strong style="color:var(--primary); font-size:1.15rem;">${this.targetNumber}</strong>`;
      html += `</div>`;

      this.dom.solution.innerHTML = html;
      this.dom.solution.classList.remove('hidden');
      this.dom.solveBtn.textContent = 'Lösungsweg verbergen';
    },

    updateStatsUI() {
      this.dom.correctCount.textContent = this.stats.data.correct;
      this.dom.totalCount.textContent = this.stats.data.total;
      this.dom.streak.textContent = this.stats.data.streak;
    }
  };

  // ==========================================================================
  // MODUL 3: 0x HEX-TRAINER (HEXADEZIMAL)
  // ==========================================================================
  const hexTrainer = {
    mode: 'bin2hex', // 'bin2hex', 'hex2bin', 'dec2hex'
    currentQuestion: null,
    stats: new StatsManager('hex'),

    dom: {
      modeCards: document.querySelectorAll('.fisi-mode-card[data-hexmode]'),
      qTitle: document.getElementById('hexQuestionTitle'),
      qBadge: document.getElementById('hexQuestionBadge'),
      qHint: document.getElementById('hexQuestionHint'),
      nibbleBreakdown: document.getElementById('hexNibbleBreakdownArea'),
      input: document.getElementById('hexInput'),
      inputLabel: document.getElementById('hexInputLabel'),
      checkBtn: document.getElementById('hexCheckBtn'),
      nextBtn: document.getElementById('hexNextBtn'),
      solveBtn: document.getElementById('hexSolveBtn'),
      feedback: document.getElementById('hexFeedback'),
      solution: document.getElementById('hexSolution'),
      correctCount: document.getElementById('hexCorrectCount'),
      totalCount: document.getElementById('hexTotalCount'),
      streak: document.getElementById('hexStreak')
    },

    init() {
      this.dom.modeCards.forEach(card => {
        card.addEventListener('click', () => {
          this.dom.modeCards.forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          this.mode = card.getAttribute('data-hexmode');
          this.newQuestion();
        });
      });

      this.dom.checkBtn.addEventListener('click', () => this.checkAnswer());
      this.dom.nextBtn.addEventListener('click', () => this.newQuestion());
      this.dom.solveBtn.addEventListener('click', () => this.toggleSolution());
      this.dom.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.checkAnswer();
      });

      this.updateStatsUI();
      this.newQuestion();
    },

    newQuestion() {
      const decVal = ConversionUtils.getRandomInt(5, 255);
      const binPadded = decVal.toString(2).padStart(8, '0');
      const hexStr = decVal.toString(16).toUpperCase().padStart(2, '0');

      this.currentQuestion = {
        dec: decVal,
        bin: binPadded,
        hex: hexStr
      };

      this.dom.feedback.className = 'feedback-box hidden';
      this.dom.feedback.innerHTML = '';
      this.dom.solution.classList.add('hidden');
      this.dom.solution.innerHTML = '';
      this.dom.solveBtn.textContent = 'Lösungsweg anzeigen';
      this.dom.input.value = '';

      this.renderQuestion();
      this.dom.input.focus();
    },

    renderQuestion() {
      const q = this.currentQuestion;
      this.dom.nibbleBreakdown.innerHTML = '';

      if (this.mode === 'bin2hex') {
        this.dom.qTitle.textContent = 'Binärzahl ➔ Hexadezimal (Nibble-Methode):';
        this.dom.qBadge.textContent = ConversionUtils.formatBinary(q.bin, 8);
        this.dom.qHint.textContent = 'Teile das Byte in zwei 4-Bit Nibbles und bestimme jeweils die Hex-Ziffer (0–F):';
        this.dom.inputLabel.textContent = 'Ergebnis in Hex (z. B. 3F oder A7):';
        this.dom.input.placeholder = 'z. B. ' + q.hex;

        // Visualisiere die 2 Nibbles
        const nibbles = ConversionUtils.getNibbleBreakdown(q.dec, 8);
        nibbles.forEach((n, idx) => {
          const card = document.createElement('div');
          card.className = 'nibble-card';
          card.innerHTML = `
            <span class="nibble-label">Nibble ${idx === 0 ? 'High (Bit 7-4)' : 'Low (Bit 3-0)'}</span>
            <span class="nibble-bits">${n.bits}</span>
            <span class="nibble-arrow-down">⬇️</span>
            <span class="nibble-hex-val">?</span>
          `;
          this.dom.nibbleBreakdown.appendChild(card);
        });

      } else if (this.mode === 'hex2bin') {
        this.dom.qTitle.textContent = 'Hexadezimal ➔ Binär (Expansion):';
        this.dom.qBadge.textContent = `0x${q.hex}`;
        this.dom.qHint.textContent = `Wandle jede Hex-Ziffer einzeln in einen 4-Bit Binärblock (Nibble) um:`;
        this.dom.inputLabel.textContent = 'Ergebnis in Binär (8 Bits):';
        this.dom.input.placeholder = 'z. B. 10101111';

      } else if (this.mode === 'dec2hex') {
        // Wechsele zufällig zwischen Dec->Hex und Hex->Dec
        const subSub = Math.random() > 0.5;
        this.currentQuestion.isDecToHex = subSub;

        if (subSub) {
          this.dom.qTitle.textContent = 'Dezimalzahl ➔ Hexadezimal:';
          this.dom.qBadge.textContent = q.dec;
          this.dom.qHint.textContent = `Berechne den Hex-Wert (z. B. per Division durch 16 oder über Binär/Nibble):`;
          this.dom.inputLabel.textContent = 'Ergebnis in Hex:';
          this.dom.input.placeholder = 'z. B. ' + q.hex;
        } else {
          this.dom.qTitle.textContent = 'Hexadezimal ➔ Dezimalzahl:';
          this.dom.qBadge.textContent = `0x${q.hex}`;
          this.dom.qHint.textContent = `Berechne den Dezimalwert: (${q.hex[0]} × 16 + ${q.hex[1]} × 1):`;
          this.dom.inputLabel.textContent = 'Ergebnis in Dezimal:';
          this.dom.input.placeholder = 'z. B. 187';
        }
      }
    },

    checkAnswer() {
      const q = this.currentQuestion;
      const raw = this.dom.input.value.trim();
      if (!raw) return;

      let isCorrect = false;
      let expectedStr = '';

      if (this.mode === 'bin2hex') {
        const clean = ConversionUtils.cleanHex(raw);
        isCorrect = clean === q.hex || clean === q.hex.replace(/^0/, '');
        expectedStr = `0x${q.hex}`;

      } else if (this.mode === 'hex2bin') {
        const clean = raw.replace(/\s+/g, '');
        isCorrect = clean === q.bin || clean === q.bin.replace(/^0+/, '');
        expectedStr = ConversionUtils.formatBinary(q.bin, 8);

      } else if (this.mode === 'dec2hex') {
        if (q.isDecToHex) {
          const clean = ConversionUtils.cleanHex(raw);
          isCorrect = clean === q.hex || clean === q.hex.replace(/^0/, '');
          expectedStr = `0x${q.hex}`;
        } else {
          isCorrect = parseInt(raw, 10) === q.dec;
          expectedStr = String(q.dec);
        }
      }

      if (isCorrect) {
        sounds.playSuccess();
        this.showFeedback(true, `Exakt richtig! Dezimal ${q.dec} entspricht binär <code>${ConversionUtils.formatBinary(q.bin, 8)}</code> und hexadezimal <strong>0x${q.hex}</strong>.`);
        // Reveal nibbles if present
        const nibbleHexEls = this.dom.nibbleBreakdown.querySelectorAll('.nibble-hex-val');
        if (nibbleHexEls.length === 2) {
          nibbleHexEls[0].textContent = q.hex[0];
          nibbleHexEls[1].textContent = q.hex[1];
        }
      } else {
        sounds.playError();
        this.showFeedback(false, `Nicht ganz: Richtig wäre <strong>${expectedStr}</strong> gewesen.`);
      }

      this.stats.recordAnswer(isCorrect);
      this.updateStatsUI();
    },

    showFeedback(isCorrect, msg) {
      this.dom.feedback.className = `feedback-box ${isCorrect ? 'success' : 'error'}`;
      this.dom.feedback.innerHTML = `
        <div class="feedback-title">${isCorrect ? '✅ Korrekt!' : '❌ Leider falsch'}</div>
        <p>${msg}</p>
      `;
      this.dom.feedback.classList.remove('hidden');
    },

    toggleSolution() {
      if (!this.dom.solution.classList.contains('hidden')) {
        this.dom.solution.classList.add('hidden');
        this.dom.solveBtn.textContent = 'Lösungsweg anzeigen';
        return;
      }

      const q = this.currentQuestion;
      const nibbles = ConversionUtils.getNibbleBreakdown(q.dec, 8);

      let html = `<h4>Lösungsweg: Die 4-Bit Nibble-Methode:</h4>`;
      html += `<p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:0.6rem;">`;
      html += `Jedes Byte besteht aus zwei Hälften (Nibbles). Jedes Nibble hat 4 Bits und entspricht exakt einer Hex-Ziffer von 0 bis F:`;
      html += `</p>`;

      html += `<div style="display:flex; gap:1rem; margin-bottom:0.8rem; flex-wrap:wrap;">`;
      nibbles.forEach((n, idx) => {
        html += `
          <div style="background:var(--bg-surface); border:1px solid var(--border-color); padding:0.6rem 1rem; border-radius:var(--radius-sm); font-family:var(--font-mono);">
            <strong>${idx === 0 ? 'High Nibble' : 'Low Nibble'}:</strong> <code>${n.bits}</code><br>
            ➔ Dezimal: ${n.decVal}<br>
            ➔ Hex: <strong style="color:var(--primary); font-size:1.1rem;">${n.hexChar}</strong>
          </div>
        `;
      });
      html += `</div>`;

      html += `<p style="font-size:0.85rem;">`;
      html += `Zusammengefügt: <code>${nibbles[0].hexChar}</code> + <code>${nibbles[1].hexChar}</code> ➔ <strong style="color:var(--primary); font-size:1.15rem;">0x${q.hex}</strong>`;
      html += `</p>`;

      this.dom.solution.innerHTML = html;
      this.dom.solution.classList.remove('hidden');
      this.dom.solveBtn.textContent = 'Lösungsweg verbergen';
    },

    updateStatsUI() {
      this.dom.correctCount.textContent = this.stats.data.correct;
      this.dom.totalCount.textContent = this.stats.data.total;
      this.dom.streak.textContent = this.stats.data.streak;
    }
  };

  // ==========================================================================
  // MODUL 4: FISI-SPEZIAL (SUBNETTING & OKTETTE)
  // ==========================================================================
  const fisiTrainer = {
    mode: 'cidr2mask',
    currentQuestion: null,
    subnetData: [
      { cidr: 24, mask: 0, bin: '00000000', magic: 256, hosts: 254, hostBits: 8 },
      { cidr: 25, mask: 128, bin: '10000000', magic: 128, hosts: 126, hostBits: 7 },
      { cidr: 26, mask: 192, bin: '11000000', magic: 64, hosts: 62, hostBits: 6 },
      { cidr: 27, mask: 224, bin: '11100000', magic: 32, hosts: 30, hostBits: 5 },
      { cidr: 28, mask: 240, bin: '11110000', magic: 16, hosts: 14, hostBits: 4 },
      { cidr: 29, mask: 248, bin: '11111000', magic: 8, hosts: 6, hostBits: 3 },
      { cidr: 30, mask: 252, bin: '11111100', magic: 4, hosts: 2, hostBits: 2 },
      { cidr: 31, mask: 254, bin: '11111110', magic: 2, hosts: 'P2P (2)', hostBits: 1 },
      { cidr: 32, mask: 255, bin: '11111111', magic: 1, hosts: '1 (Host)', hostBits: 0 }
    ],

    dom: {
      modeCards: document.querySelectorAll('.fisi-mode-card[data-fisimode]'),
      qTitle: document.getElementById('fisiQuestionTitle'),
      qBadge: document.getElementById('fisiQuestionBadge'),
      qDesc: document.getElementById('fisiQuestionDesc'),
      answersGrid: document.getElementById('fisiAnswersContainer'),
      nextBtn: document.getElementById('fisiNextBtn'),
      solveBtn: document.getElementById('fisiSolveBtn'),
      feedback: document.getElementById('fisiFeedback'),
      solution: document.getElementById('fisiSolution')
    },

    init() {
      this.dom.modeCards.forEach(card => {
        card.addEventListener('click', () => {
          this.dom.modeCards.forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          this.mode = card.getAttribute('data-fisimode');
          this.newQuestion();
        });
      });

      this.dom.nextBtn.addEventListener('click', () => this.newQuestion());
      this.dom.solveBtn.addEventListener('click', () => this.toggleSolution());

      this.newQuestion();
    },

    newQuestion() {
      const idx = ConversionUtils.getRandomInt(0, this.subnetData.length - 1);
      const item = this.subnetData[idx];
      this.currentQuestion = item;

      this.dom.feedback.className = 'feedback-box hidden';
      this.dom.feedback.innerHTML = '';
      this.dom.solution.classList.add('hidden');
      this.dom.solution.innerHTML = '';
      this.dom.solveBtn.textContent = 'Subnetz-Erklärung einblenden';

      this.renderQuestion(item);
    },

    renderQuestion(item) {
      this.dom.answersGrid.innerHTML = '';

      if (this.mode === 'cidr2mask') {
        this.dom.qTitle.textContent = 'CIDR-Präfix ➔ 4. Oktett:';
        this.dom.qBadge.textContent = `/${item.cidr}`;
        this.dom.qDesc.textContent = `Welcher Dezimalwert steht im 4. Oktett bei einer /${item.cidr} Subnetzmaske (255.255.255.XXX)?`;

        const options = this.getFourOptions(item.mask, this.subnetData.map(d => d.mask));
        options.forEach(opt => {
          const btn = document.createElement('button');
          btn.className = 'fisi-answer-btn';
          btn.textContent = opt;
          btn.addEventListener('click', () => this.checkChoice(opt === item.mask, btn, item));
          this.dom.answersGrid.appendChild(btn);
        });

      } else if (this.mode === 'mask2bin') {
        this.dom.qTitle.textContent = 'Masken-Oktett ➔ Binär:';
        this.dom.qBadge.textContent = item.mask;
        this.dom.qDesc.textContent = `Wie lautet das Oktett ${item.mask} im Binärsystem?`;

        const options = this.getFourOptions(item.bin, this.subnetData.map(d => d.bin));
        options.forEach(opt => {
          const btn = document.createElement('button');
          btn.className = 'fisi-answer-btn';
          btn.textContent = opt;
          btn.addEventListener('click', () => this.checkChoice(opt === item.bin, btn, item));
          this.dom.answersGrid.appendChild(btn);
        });

      } else if (this.mode === 'magicnumber') {
        this.dom.qTitle.textContent = 'Schrittweite (Blockgröße):';
        this.dom.qBadge.textContent = `255.255.255.${item.mask}`;
        this.dom.qDesc.textContent = `Welche Schrittweite (Magic Number = 256 - Maske) hat dieses Subnetz?`;

        const options = this.getFourOptions(item.magic, this.subnetData.map(d => d.magic));
        options.forEach(opt => {
          const btn = document.createElement('button');
          btn.className = 'fisi-answer-btn';
          btn.textContent = opt;
          btn.addEventListener('click', () => this.checkChoice(opt === item.magic, btn, item));
          this.dom.answersGrid.appendChild(btn);
        });
      }
    },

    getFourOptions(correctVal, allPossible) {
      const distinct = Array.from(new Set(allPossible));
      const pool = distinct.filter(v => v !== correctVal);
      pool.sort(() => Math.random() - 0.5);
      const chosen = pool.slice(0, 3);
      chosen.push(correctVal);
      chosen.sort(() => Math.random() - 0.5);
      return chosen;
    },

    checkChoice(isCorrect, clickedBtn, item) {
      const allBtns = this.dom.answersGrid.querySelectorAll('.fisi-answer-btn');
      allBtns.forEach(btn => btn.disabled = true);

      if (isCorrect) {
        sounds.playSuccess();
        clickedBtn.classList.add('correct');
        this.showFeedback(true, `Präzise! ${item.mask} entspricht /${item.cidr} (Binär: ${item.bin}, Schrittweite: ${item.magic}).`);
      } else {
        sounds.playError();
        clickedBtn.classList.add('wrong');
        allBtns.forEach(btn => {
          if (btn.textContent == item.mask || btn.textContent == item.bin || btn.textContent == item.magic) {
            btn.classList.add('correct');
          }
        });
        this.showFeedback(false, `Leider falsch. Die richtige Antwort ist markiert.`);
      }
    },

    showFeedback(isCorrect, msg) {
      this.dom.feedback.className = `feedback-box ${isCorrect ? 'success' : 'error'}`;
      this.dom.feedback.innerHTML = `
        <div class="feedback-title">${isCorrect ? '✅ IHK-Volltreffer!' : '❌ Falsch'}</div>
        <p>${msg}</p>
      `;
      this.dom.feedback.classList.remove('hidden');
    },

    toggleSolution() {
      if (!this.dom.solution.classList.contains('hidden')) {
        this.dom.solution.classList.add('hidden');
        this.dom.solveBtn.textContent = 'Subnetz-Erklärung einblenden';
        return;
      }

      const item = this.currentQuestion;
      const netBits = item.cidr - 24;

      let html = `<h4>Subnetz-Analyse für /${item.cidr} (255.255.255.${item.mask}):</h4>`;
      html += `<ul class="solution-steps">`;
      html += `<li><strong>Netzwerk-Bits im 4. Oktett:</strong> ${netBits} gesetzte Einsen (${item.bin})</li>`;
      html += `<li><strong>Host-Bits:</strong> ${item.hostBits} Nullen (8 - ${netBits} = ${item.hostBits})</li>`;
      html += `<li><strong>Schrittweite (Magic Number):</strong> 256 - ${item.mask} = <strong>${item.magic}</strong></li>`;
      html += `<li><strong>Adressen pro Subnetz (2<sup>H</sup>):</strong> 2<sup>${item.hostBits}</sup> = <strong>${item.magic}</strong></li>`;
      html += `<li><strong>Nutzbare Hosts:</strong> 2<sup>${item.hostBits}</sup> - 2 = <strong>${item.hosts}</strong></li>`;
      html += `</ul>`;

      this.dom.solution.innerHTML = html;
      this.dom.solution.classList.remove('hidden');
      this.dom.solveBtn.textContent = 'Subnetz-Erklärung verbergen';
    }
  };

  // ==========================================================================
  // MODUL 5: ERKLÄR-RECHNER (STEP-BY-STEP)
  // ==========================================================================
  const calculator = {
    dom: {
      inputDec: document.getElementById('calcInputDec'),
      inputBin: document.getElementById('calcInputBin'),
      inputHex: document.getElementById('calcInputHex'),
      computeBtn: document.getElementById('calcComputeBtn'),
      sampleBtn: document.getElementById('calcSampleBtn'),
      resultsArea: document.getElementById('calcResultsArea'),
      resDec: document.getElementById('calcResDec'),
      resBin: document.getElementById('calcResBin'),
      resHex: document.getElementById('calcResHex'),
      powersExplanation: document.getElementById('calcPowersExplanation'),
      divisionExplanation: document.getElementById('calcDivisionExplanation'),
      hexExplanation: document.getElementById('calcHexExplanation')
    },

    init() {
      this.dom.computeBtn.addEventListener('click', () => this.calculate());
      this.dom.sampleBtn.addEventListener('click', () => {
        const samples = [42, 173, 192, 219, 240, 255, 300, 1024];
        const r = samples[Math.floor(Math.random() * samples.length)];
        this.dom.inputDec.value = r;
        this.dom.inputBin.value = '';
        this.dom.inputHex.value = '';
        this.calculate();
      });

      this.dom.inputDec.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.dom.inputBin.value = '';
          this.dom.inputHex.value = '';
          this.calculate();
        }
      });
      this.dom.inputBin.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.dom.inputDec.value = '';
          this.dom.inputHex.value = '';
          this.calculate();
        }
      });
      this.dom.inputHex.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.dom.inputDec.value = '';
          this.dom.inputBin.value = '';
          this.calculate();
        }
      });

      this.dom.inputDec.value = 219;
      this.calculate();
    },

    calculate() {
      let decVal = null;

      if (this.dom.inputHex && this.dom.inputHex.value.trim() !== '') {
        const clean = ConversionUtils.cleanHex(this.dom.inputHex.value);
        if (/^[0-9A-F]+$/i.test(clean)) {
          decVal = parseInt(clean, 16);
        }
      } else if (this.dom.inputBin.value.trim() !== '') {
        const binClean = this.dom.inputBin.value.trim().replace(/\s+/g, '');
        if (/^[01]+$/.test(binClean)) {
          decVal = parseInt(binClean, 2);
        }
      } else if (this.dom.inputDec.value.trim() !== '') {
        decVal = parseInt(this.dom.inputDec.value.trim(), 10);
      }

      if (decVal === null || isNaN(decVal) || decVal < 0) {
        alert('Bitte gib eine gültige Zahl (Dezimal, Binär oder Hex) ein.');
        return;
      }

      const binStr = decVal.toString(2);
      const hexStr = '0x' + decVal.toString(16).toUpperCase();

      this.dom.resDec.textContent = decVal;
      this.dom.resBin.textContent = ConversionUtils.formatBinary(binStr, binStr.length <= 8 ? 8 : 16);
      this.dom.resHex.textContent = hexStr;

      // Methode 1: Stellenwertmethode
      this.renderPowersMethod(decVal);

      // Methode 2: Divisionsmethode
      this.renderDivisionMethod(decVal);

      // Methode 3: Hexadezimal / Nibbles
      this.renderHexMethod(decVal);

      this.dom.resultsArea.classList.remove('hidden');
    },

    renderPowersMethod(decVal) {
      const bitCount = decVal <= 255 ? 8 : (decVal <= 65535 ? 16 : 32);
      const steps = ConversionUtils.getStellenwertSteps(decVal, bitCount);

      let html = `<p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:0.6rem;">`;
      html += `Zweierpotenzen von links nach rechts subtrahieren:`;
      html += `</p>`;

      html += `<div class="table-responsive">`;
      html += `<table class="method-step-table">`;
      html += `<thead><tr><th>Potenz</th><th>Wert</th><th>Rest vorher</th><th>Passt?</th><th>Bit</th><th>Neuer Rest</th></tr></thead>`;
      html += `<tbody>`;

      steps.forEach(s => {
        const rowBg = s.fits ? 'style="background:rgba(56, 189, 248, 0.08); font-weight:700;"' : '';
        html += `<tr ${rowBg}>`;
        html += `<td>2<sup>${s.power}</sup></td>`;
        html += `<td>${s.val}</td>`;
        html += `<td>${s.prevRemainder}</td>`;
        html += `<td>${s.fits ? 'Ja' : 'Nein'}</td>`;
        html += `<td style="color:${s.fits ? 'var(--primary)' : 'var(--text-muted)'}; font-size:1.05rem;">${s.bit}</td>`;
        html += `<td>${s.newRemainder}</td>`;
        html += `</tr>`;
      });

      html += `</tbody></table></div>`;
      this.dom.powersExplanation.innerHTML = html;
    },

    renderDivisionMethod(decVal) {
      const steps = ConversionUtils.getDivisionSteps(decVal);

      let html = `<p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:0.6rem;">`;
      html += `Wiederholt ganzzahlig durch <strong>2</strong> teilen:`;
      html += `</p>`;

      html += `<div class="table-responsive">`;
      html += `<table class="method-step-table">`;
      html += `<thead><tr><th>Rechnung</th><th>Ergebnis</th><th>Rest (Bit)</th></tr></thead>`;
      html += `<tbody>`;

      steps.forEach(s => {
        html += `<tr>`;
        html += `<td>${s.original} : 2</td>`;
        html += `<td>${s.divResult}</td>`;
        html += `<td style="color:var(--warning); font-weight:700; font-size:1.05rem;">${s.remainder}</td>`;
        html += `</tr>`;
      });

      html += `</tbody></table></div>`;
      html += `<div class="remainder-arrow">`;
      html += `<span>⬆️ Leserichtung: Von UNTEN nach OBEN!</span>`;
      html += `</div>`;

      this.dom.divisionExplanation.innerHTML = html;
    },

    renderHexMethod(decVal) {
      const nibbles = ConversionUtils.getNibbleBreakdown(decVal, 8);
      const hexSteps = ConversionUtils.getHexDivisionSteps(decVal);

      let html = `<h4>1. Nibble-Prinzip (Die schnelle Methode):</h4>`;
      html += `<p style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:0.5rem;">Fasse die Binärzahl in 4er-Blöcke zusammen:</p>`;

      html += `<div style="display:flex; gap:0.6rem; margin-bottom:0.8rem; flex-wrap:wrap;">`;
      nibbles.forEach((n, idx) => {
        html += `
          <div style="background:var(--bg-surface); border:1px solid var(--border-color); padding:0.4rem 0.6rem; border-radius:var(--radius-sm); font-size:0.8rem; font-family:var(--font-mono);">
            Nibble ${idx + 1}: <strong>${n.bits}</strong> = ${n.decVal} ➔ <span style="color:var(--primary); font-weight:700;">${n.hexChar}</span>
          </div>
        `;
      });
      html += `</div>`;

      html += `<h4 style="margin-top:0.8rem;">2. Division durch 16 mit Rest (Mathematischer Formalweg):</h4>`;
      html += `<div class="table-responsive">`;
      html += `<table class="method-step-table">`;
      html += `<thead><tr><th>Rechnung</th><th>Ergebnis</th><th>Rest</th><th>Hex</th></tr></thead>`;
      html += `<tbody>`;

      hexSteps.forEach(s => {
        html += `<tr>`;
        html += `<td>${s.original} : 16</td>`;
        html += `<td>${s.divResult}</td>`;
        html += `<td>${s.remainder}</td>`;
        html += `<td style="color:var(--accent); font-weight:700; font-size:1.05rem;">${s.hexChar}</td>`;
        html += `</tr>`;
      });

      html += `</tbody></table></div>`;
      html += `<div class="remainder-arrow">`;
      html += `<span>⬆️ Hex-Ziffern von UNTEN nach OBEN lesen!</span>`;
      html += `</div>`;

      this.dom.hexExplanation.innerHTML = html;
    }
  };

  // ==========================================================================
  // MODUL 6: PRÜFUNGS-SPRINT (SPEED CHALLENGE)
  // ==========================================================================
  const challenge = {
    active: false,
    questions: [],
    currentIndex: 0,
    score: 0,
    correctAnswers: 0,
    startTime: 0,
    timerInterval: null,
    errors: [],

    dom: {
      startScreen: document.getElementById('challengeStartScreen'),
      activeScreen: document.getElementById('challengeActiveScreen'),
      endScreen: document.getElementById('challengeEndScreen'),
      startBtn: document.getElementById('challengeStartBtn'),
      restartBtn: document.getElementById('challengeRestartBtn'),
      progressBar: document.getElementById('challengeProgressBar'),
      qIndex: document.getElementById('challengeQuestionIndex'),
      timer: document.getElementById('challengeTimer'),
      liveScore: document.getElementById('challengeLiveScore'),
      typeLabel: document.getElementById('challengeTypeLabel'),
      targetBadge: document.getElementById('challengeTargetBadge'),
      hintLabel: document.getElementById('challengeHintLabel'),
      input: document.getElementById('challengeInput'),
      submitBtn: document.getElementById('challengeSubmitBtn'),
      feedback: document.getElementById('challengeFeedback'),
      finalCorrect: document.getElementById('challengeFinalCorrect'),
      finalTime: document.getElementById('challengeFinalTime'),
      finalScore: document.getElementById('challengeFinalScore'),
      errorBreakdown: document.getElementById('challengeErrorBreakdown')
    },

    init() {
      this.dom.startBtn.addEventListener('click', () => this.startSprint());
      this.dom.restartBtn.addEventListener('click', () => this.startSprint());
      this.dom.submitBtn.addEventListener('click', () => this.submitAnswer());
      this.dom.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.submitAnswer();
      });
    },

    startSprint() {
      this.active = true;
      this.currentIndex = 0;
      this.score = 0;
      this.correctAnswers = 0;
      this.errors = [];
      this.generateQuestions();

      this.dom.startScreen.classList.add('hidden');
      this.dom.endScreen.classList.add('hidden');
      this.dom.activeScreen.classList.remove('hidden');

      this.startTime = Date.now();
      clearInterval(this.timerInterval);
      this.timerInterval = setInterval(() => this.updateTimer(), 1000);
      this.updateTimer();

      this.loadQuestion();
    },

    generateQuestions() {
      this.questions = [];
      // 10 gemischte Fragen: 3x Dec->Bin, 3x Bin->Dec, 2x FiSi-Subnetting, 2x Hex
      for (let i = 0; i < 3; i++) {
        const val = ConversionUtils.getRandomInt(5, 250);
        this.questions.push({
          type: 'dec2bin',
          title: 'Dezimal ➔ Binär:',
          display: val,
          hint: 'Gib die 8-Bit Binärzahl ein (z. B. 10110010):',
          expected: val.toString(2),
          altExpected: val.toString(2).padStart(8, '0'),
          numericVal: val
        });
      }

      for (let i = 0; i < 3; i++) {
        const val = ConversionUtils.getRandomInt(5, 250);
        const bin = val.toString(2).padStart(8, '0');
        this.questions.push({
          type: 'bin2dec',
          title: 'Binär ➔ Dezimal:',
          display: ConversionUtils.formatBinary(bin, 8),
          hint: 'Berechne den Dezimalwert:',
          expected: String(val),
          altExpected: String(val),
          numericVal: val
        });
      }

      const subnets = [
        { cidr: '/26', mask: '192' },
        { cidr: '/27', mask: '224' },
        { cidr: '/28', mask: '240' },
        { cidr: '/29', mask: '248' },
        { cidr: '/30', mask: '252' }
      ];
      subnets.sort(() => Math.random() - 0.5);

      for (let i = 0; i < 2; i++) {
        const sub = subnets[i];
        this.questions.push({
          type: 'subnet',
          title: 'Subnetzmaske für Präfix:',
          display: sub.cidr,
          hint: 'Welcher Dezimalwert steht im 4. Oktett? (255.255.255.???):',
          expected: sub.mask,
          altExpected: sub.mask,
          numericVal: parseInt(sub.mask, 10)
        });
      }

      // 2x Hex-Fragen
      const hexVal1 = ConversionUtils.getRandomInt(10, 255);
      this.questions.push({
        type: 'bin2hex',
        title: 'Binär ➔ Hexadezimal:',
        display: ConversionUtils.formatBinary(hexVal1.toString(2), 8),
        hint: 'Ermittle den Hex-Wert (2 Ziffern, z. B. 3F):',
        expected: hexVal1.toString(16).toUpperCase(),
        altExpected: '0x' + hexVal1.toString(16).toUpperCase(),
        numericVal: hexVal1
      });

      const hexVal2 = ConversionUtils.getRandomInt(16, 255);
      this.questions.push({
        type: 'hex2dec',
        title: 'Hexadezimal ➔ Dezimal:',
        display: '0x' + hexVal2.toString(16).toUpperCase(),
        hint: 'Berechne den Dezimalwert:',
        expected: String(hexVal2),
        altExpected: String(hexVal2),
        numericVal: hexVal2
      });

      this.questions.sort(() => Math.random() - 0.5);
    },

    loadQuestion() {
      if (this.currentIndex >= this.questions.length) {
        this.finishSprint();
        return;
      }

      const q = this.questions[this.currentIndex];
      this.dom.qIndex.textContent = this.currentIndex + 1;
      this.dom.progressBar.style.width = `${((this.currentIndex + 1) / 10) * 100}%`;
      this.dom.typeLabel.textContent = q.title;
      this.dom.targetBadge.textContent = q.display;
      this.dom.hintLabel.textContent = q.hint;
      this.dom.liveScore.textContent = this.score;

      this.dom.input.value = '';
      this.dom.input.focus();
      this.dom.feedback.className = 'feedback-box hidden';
    },

    submitAnswer() {
      const q = this.questions[this.currentIndex];
      const rawInput = this.dom.input.value.trim().replace(/\s+/g, '');
      if (!rawInput) return;

      let isCorrect = false;
      if (q.type === 'dec2bin') {
        const inputNum = parseInt(rawInput, 2);
        isCorrect = !isNaN(inputNum) && inputNum === q.numericVal;
      } else if (q.type === 'bin2hex') {
        const clean = ConversionUtils.cleanHex(rawInput);
        isCorrect = clean === q.expected || clean === q.expected.replace(/^0/, '');
      } else {
        isCorrect = rawInput.toLowerCase() === q.expected.toLowerCase() ||
                    rawInput.toLowerCase() === q.altExpected.toLowerCase();
      }

      if (isCorrect) {
        sounds.playSuccess();
        this.score += 100;
        this.correctAnswers++;
      } else {
        sounds.playError();
        this.errors.push({
          question: `${q.title} ${q.display}`,
          userAnswer: rawInput,
          correctAnswer: q.altExpected
        });
      }

      this.currentIndex++;
      this.loadQuestion();
    },

    updateTimer() {
      const elapsedSec = Math.floor((Date.now() - this.startTime) / 1000);
      const min = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
      const sec = String(elapsedSec % 60).padStart(2, '0');
      this.dom.timer.textContent = `${min}:${sec}`;
    },

    finishSprint() {
      clearInterval(this.timerInterval);
      const totalTimeStr = this.dom.timer.textContent;

      this.dom.activeScreen.classList.add('hidden');
      this.dom.endScreen.classList.remove('hidden');

      this.dom.finalCorrect.textContent = `${this.correctAnswers}/10`;
      this.dom.finalTime.textContent = totalTimeStr;
      this.dom.finalScore.textContent = this.score;

      if (this.errors.length === 0) {
        this.dom.errorBreakdown.innerHTML = `
          <div style="background:var(--success-bg); border:1px solid var(--success-border); padding:1rem; border-radius:var(--radius-md); text-align:center; color:var(--success);">
            🎉 Fehlerfrei! Du beherrschst Dezimal, Binär, Subnetting und Hexadezimal souverän!
          </div>
        `;
      } else {
        let errHtml = `<h4>Zu wiederholende Aufgaben (${this.errors.length}):</h4>`;
        this.errors.forEach(err => {
          errHtml += `
            <div class="error-item">
              <strong>${err.question}</strong><br>
              Deine Antwort: <span style="color:var(--error);">${err.userAnswer}</span> |
              Richtig: <span style="color:var(--success); font-weight:700;">${err.correctAnswer}</span>
            </div>
          `;
        });
        this.dom.errorBreakdown.innerHTML = errHtml;
      }
    }
  };

  // Initialisierung
  dec2bin.init();
  bin2dec.init();
  hexTrainer.init();
  fisiTrainer.init();
  calculator.init();
  challenge.init();

  // Globaler Keyboard-Listener
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const activeTab = document.querySelector('.tab-panel.active');
      if (!activeTab) return;

      if (activeTab.id === 'tab-dec2bin' && document.activeElement !== dec2bin.dom.nextBtn) {
        if (dec2bin.inputMode === 'switches') dec2bin.checkAnswer();
      }
    }
  });
});
