let currentMatches = [];
let wordDB = [];
let dbReady = false;

const titleInput = document.getElementById('title-input');
const debugLog = document.getElementById('debug-log');
const noteBody = document.getElementById('note-body');
const metaRow = document.getElementById('meta-row');

// 1. HIGH-SPEED DATABASE FETCH
async function initDB() {
    try {
        const response = await fetch('wordDB_100k.js');
        const text = await response.text();
        
        // Clean the "const wordDB =" part to get pure JSON
        const jsonContent = text.substring(text.indexOf('['), text.lastIndexOf(']') + 1);
        wordDB = JSON.parse(jsonContent);
        
        dbReady = true;
        debugLog.innerText = "READY";
        updateTime();
    } catch (err) {
        debugLog.innerText = "OFFLINE ERROR";
        console.error(err);
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

// 2. LOGIC (Optimized for 100k words)
document.getElementById('btn-search').addEventListener('click', () => {
    if (!dbReady) return;
    const input = titleInput.value.trim().toLowerCase();
    if (!input) return;

    if (/^\d+$/.test(input)) {
        // Initial search vs refinement
        let source = (currentMatches.length === 0) ? wordDB : currentMatches;

        if (input.length >= 2 && currentMatches.length === 0) {
            const L = parseInt(input.substring(0, 2));
            const V = [];
            for (let i = 2; i < input.length; i += 2) {
                V.push(parseInt(input.substring(i, i + 2)));
            }
            currentMatches = source.filter(x => x.len === L && V.every(vPos => x.v.includes(vPos)));
        } else {
            const pos = parseInt(input);
            currentMatches = currentMatches.filter(x => x.v.includes(pos));
        }
    } else if (/^[scm]+$/.test(input)) {
        const s = input.split('');
        currentMatches = currentMatches.filter(x => s.every((char, i) => x.s[i] === char));
    }
    
    showResult();
});

function showResult() {
    if (currentMatches.length > 1) {
        debugLog.innerText = currentMatches.slice(0, 4).map(x => x.word).join(" | ");
        titleInput.value = "";
    } else if (currentMatches.length === 1) {
        titleInput.value = "Your word is";
        noteBody.innerText = currentMatches[0].word;
        debugLog.innerText = "";
        if (navigator.vibrate) navigator.vibrate([40, 40, 40]);
    } else {
        debugLog.innerText = "NO MATCH";
        currentMatches = [];
    }
}

document.getElementById('btn-reset').addEventListener('click', () => {
    currentMatches = [];
    titleInput.value = "";
    titleInput.placeholder = "Title";
    noteBody.innerText = "";
    debugLog.innerText = "READY";
    updateTime();
});

initDB();
