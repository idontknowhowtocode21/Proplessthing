let currentMatches = [];
let dbActive = false;
const titleInput = document.getElementById('title-input');
const debugLog = document.getElementById('debug-log');
const noteBody = document.getElementById('note-body');
const metaRow = document.getElementById('meta-row');

// 1. HARD-LOADER LOOP
function bootApp() {
    if (typeof wordDB !== 'undefined') {
        dbActive = true;
        debugLog.innerText = "READY";
        updateTime();
    } else {
        debugLog.innerText = "LINKING DB...";
        setTimeout(bootApp, 300); // Check every 0.3s
    }
}

function updateTime() {
    const now = new Date();
    let hh = now.getHours();
    const mm = now.getMinutes().toString().padStart(2, '0');
    const suffix = hh >= 12 ? 'pm' : 'am';
    hh = hh % 12 || 12;
    metaRow.innerHTML = `Today ${hh}:${mm} ${suffix} &nbsp;No category`;
}

// 2. SEARCH ENGINE
document.getElementById('btn-search').addEventListener('click', () => {
    if (!dbActive) return;
    const val = titleInput.value.trim().toLowerCase();
    if (!val) return;

    // SCENARIO A: NUMBERS (Length / Vowels)
    if (/^\d+$/.test(val)) {
        if (currentMatches.length === 0) {
            // New Search: e.g., 040102
            const targetLen = parseInt(val.substring(0, 2));
            let targets = [];
            for (let i = 2; i < val.length; i += 2) {
                let p = parseInt(val.substring(i, i + 2));
                if (!isNaN(p)) targets.push(p);
            }
            currentMatches = wordDB.filter(item => 
                item.len === targetLen && targets.every(t => item.v.includes(t))
            );
        } else {
            // Refine hit list: e.g., 07
            const p = parseInt(val);
            currentMatches = currentMatches.filter(item => item.v.includes(p));
        }
    } 
    // SCENARIO B: LETTERS (Shapes s, c, m)
    else if (/^[scm]+$/.test(val)) {
        const shapes = val.split('');
        currentMatches = currentMatches.filter(item => 
            shapes.every((s, i) => item.s[i] === s)
        );
    }

    render();
});

function render() {
    if (currentMatches.length > 1) {
        // Multi-hits: Hidden in the dark at the bottom
        debugLog.innerText = currentMatches.slice(0, 4).map(x => x.word).join(" | ");
        titleInput.value = "";
        titleInput.placeholder = "Tasks";
    } else if (currentMatches.length === 1) {
        // Single hit: The Revelation
        titleInput.value = "Your word is";
        noteBody.innerText = currentMatches[0].word;
        debugLog.innerText = "";
        if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
    } else {
        debugLog.innerText = "NO MATCH";
        currentMatches = [];
    }
}

// 3. NUCLEAR RESET (Top Left Button)
document.getElementById('btn-reset').addEventListener('click', () => {
    currentMatches = [];
    titleInput.value = "";
    titleInput.placeholder = "Title";
    noteBody.innerText = "";
    debugLog.innerText = "READY";
    updateTime();
    if (navigator.vibrate) navigator.vibrate(10);
});

bootApp();
