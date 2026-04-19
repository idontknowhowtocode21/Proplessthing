let currentMatches = [];
const titleInput = document.getElementById('title-input');
const debugLog = document.getElementById('debug-log');
const noteBody = document.getElementById('note-body');
const metaRow = document.getElementById('meta-row');

// Update time format to: "Today 10:41 pm"
function updateTimestamp() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // convert 0 to 12
    metaRow.innerHTML = `Today ${hours}:${minutes} ${ampm} &nbsp;No category`;
}

// Initial call
updateTimestamp();

// Master Search Handler
document.getElementById('btn-search').addEventListener('click', () => {
    const input = titleInput.value.trim().toLowerCase();
    if (!input) return;

    if (/^\d+$/.test(input)) {
        handleNumericInput(input);
    } else if (/^[scm]+$/.test(input)) {
        handleShapeInput(input);
    }
    
    finalizeResults();
});

function handleNumericInput(str) {
    let source = currentMatches.length > 0 ? currentMatches : wordDB;

    if (str.length >= 2 && currentMatches.length === 0) {
        const lengthTarget = parseInt(str.substring(0, 2));
        let vowelTargets = [];
        for (let i = 2; i < str.length; i += 2) {
            let pos = parseInt(str.substring(i, i + 2));
            if (!isNaN(pos)) vowelTargets.push(pos);
        }

        currentMatches = wordDB.filter(item => {
            if (item.len !== lengthTarget) return false;
            return vowelTargets.every(vPos => item.v.includes(vPos));
        });
    } else {
        const additionalVowel = parseInt(str);
        currentMatches = source.filter(item => item.v.includes(additionalVowel));
    }
}

function handleShapeInput(str) {
    if (currentMatches.length === 0) return;
    const shapes = str.split('');
    currentMatches = currentMatches.filter(item => {
        return shapes.every((char, index) => item.s[index] === char);
    });
}

function finalizeResults() {
    const count = currentMatches.length;
    if (count > 1) {
        debugLog.innerText = currentMatches.slice(0, 4).map(i => i.word).join(" | ");
        titleInput.value = ""; 
        titleInput.placeholder = "Title";
    } 
    else if (count === 1) {
        const winner = currentMatches[0].word;
        titleInput.value = "Your word is";
        noteBody.innerText = winner;
        debugLog.innerText = "";
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
    } else {
        debugLog.innerText = "NO MATCHES";
    }
}

// Full Reset Logic (Top-Left Back Button)
document.getElementById('btn-reset').addEventListener('click', () => {
    currentMatches = [];
    titleInput.value = "";
    titleInput.placeholder = "Title";
    noteBody.innerText = "";
    debugLog.innerText = "READY";
    
    // Update the time for the new session
    updateTimestamp();
    
    if (navigator.vibrate) navigator.vibrate(10);
});
