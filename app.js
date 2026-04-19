let currentMatches = [];
const titleInput = document.getElementById('title-input');
const debugLog = document.getElementById('debug-log');
const noteBody = document.getElementById('note-body');
const metaRow = document.getElementById('meta-row');

// 1. Database Readiness Check
window.onload = () => {
    if (typeof wordDB !== 'undefined') {
        debugLog.innerText = "READY";
        updateTimestamp();
    } else {
        debugLog.innerText = "DB ERROR: wordDB NOT LOADED";
        debugLog.style.color = "red";
    }
};

function updateTimestamp() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    metaRow.innerHTML = `Today ${hours}:${minutes} ${ampm} &nbsp;No category`;
}

// 2. Search Execution
document.getElementById('btn-search').addEventListener('click', () => {
    const rawInput = titleInput.value.trim().toLowerCase();
    if (!rawInput || typeof wordDB === 'undefined') return;

    // NUMERIC ROUTE (Length + Vowel Positions)
    if (/^\d+$/.test(rawInput)) {
        if (currentMatches.length === 0) {
            // New Search: e.g., 090204
            const targetLen = parseInt(rawInput.substring(0, 2));
            let targetVowels = [];
            for (let i = 2; i < rawInput.length; i += 2) {
                let v = parseInt(rawInput.substring(i, i + 2));
                if (!isNaN(v)) targetVowels.push(v);
            }

            currentMatches = wordDB.filter(item => {
                if (item.len !== targetLen) return false;
                return targetVowels.every(pos => item.v.includes(pos));
            });
        } else {
            // Refining existing matches: e.g., 07
            const vPos = parseInt(rawInput);
            currentMatches = currentMatches.filter(item => item.v.includes(vPos));
        }
    } 
    // SHAPE ROUTE (s, c, m)
    else if (/^[scm]+$/.test(rawInput)) {
        const shapes = rawInput.split('');
        currentMatches = currentMatches.filter(item => {
            return shapes.every((char, idx) => item.s[idx] === char);
        });
    }

    finalizeResults();
});

function finalizeResults() {
    const count = currentMatches.length;
    
    if (count > 1) {
        // Show hidden hits
        debugLog.innerText = currentMatches.slice(0, 4).map(w => w.word).join(" | ");
        titleInput.value = "";
        titleInput.placeholder = "Title";
        if (navigator.vibrate) navigator.vibrate(20);
    } 
    else if (count === 1) {
        // Found it
        const result = currentMatches[0].word;
        titleInput.value = "Your word is";
        noteBody.innerText = result;
        debugLog.innerText = "";
        if (navigator.vibrate) navigator.vibrate([40, 40, 40]);
    } else {
        debugLog.innerText = "NO MATCH";
        titleInput.value = "";
    }
}

// 3. Reset Button (Top Left)
document.getElementById('btn-reset').addEventListener('click', () => {
    currentMatches = [];
    titleInput.value = "";
    titleInput.placeholder = "Title";
    noteBody.innerText = "";
    debugLog.innerText = "READY";
    updateTimestamp();
    if (navigator.vibrate) navigator.vibrate(10);
});
