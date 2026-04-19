let currentMatches = [];
let wordDB = [];
let dbReady = false;

const titleInput = document.getElementById('title-input');
const debugLog = document.getElementById('debug-log');
const noteBody = document.getElementById('note-body');
const metaRow = document.getElementById('meta-row');

// 1. FAST LOADER
async function initDB() {
    try {
        const response = await fetch('wordDB_100k.js');
        const text = await response.text();
        const jsonStr = text.substring(text.indexOf('['), text.lastIndexOf(']') + 1);
        wordDB = JSON.parse(jsonStr);
        dbReady = true;
        debugLog.innerText = "READY";
        updateTime();
    } catch (e) {
        debugLog.innerText = "DB LOAD ERROR";
    }
}

function updateTime() {
    const now = new Date();
    let hh = now.getHours();
    const mm = now.getMinutes().toString().padStart(2, '0');
    const ampm = hh >= 12 ? 'pm' : 'am';
    hh = hh % 12 || 12;
    metaRow.innerHTML = `Today ${hh}:${mm} ${ampm} &nbsp;No category`;
}

// 2. SEARCH & OVERRIDE
document.getElementById('btn-search').addEventListener('click', () => {
    if (!dbReady) return;
    const val = titleInput.value.trim().toLowerCase();
    if (!val) return;

    if (/^\d+$/.test(val)) {
        let source = (currentMatches.length === 0) ? wordDB : currentMatches;
        if (val.length >= 2 && currentMatches.length === 0) {
            const L = parseInt(val.substring(0, 2));
            const V = [];
            for (let i = 2; i < val.length; i += 2) { V.push(parseInt(val.substring(i, i + 2))); }
            currentMatches = source.filter(x => x.len === L && V.every(pos => x.v.includes(pos)));
        } else {
            const p = parseInt(val);
            currentMatches = currentMatches.filter(x => x.v.includes(p));
        }
    } else if (/^[scm]+$/.test(val)) {
        const sArr = val.split('');
        currentMatches = currentMatches.filter(x => sArr.every((s, i) => x.s[i] === s));
    }
    renderResults();
});

function renderResults() {
    const count = currentMatches.length;
    if (count > 1) {
        debugLog.innerText = `${count} Hits | ` + currentMatches.slice(0, 5).map(x => x.word).join(" | ");
        titleInput.value = "";
    } else if (count === 1) {
        revealWord(currentMatches[0].word);
    } else {
        debugLog.innerText = "NO MATCH";
        currentMatches = [];
    }
}

function revealWord(word) {
    titleInput.value = "Your word is";
    noteBody.innerText = word;
    debugLog.innerText = "";
    if (navigator.vibrate) navigator.vibrate([40, 40, 40]);
}

// 3. LONG PRESS OVERRIDE
let longPressTimer;
document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('touchstart', (e) => {
        longPressTimer = setTimeout(() => {
            const idx = parseInt(e.target.dataset.index);
            if (currentMatches[idx]) {
                revealWord(currentMatches[idx].word);
            }
        }, 600);
    });
    btn.addEventListener('touchend', () => clearTimeout(longPressTimer));
});

// 4. RESET
document.getElementById('btn-reset').addEventListener('click', () => {
    currentMatches = [];
    titleInput.value = "";
    titleInput.placeholder = "Title";
    noteBody.innerText = "";
    debugLog.innerText = "READY";
    updateTime();
});

initDB();
