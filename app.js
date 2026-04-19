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
    hours = hours ? hours : 12;
    metaRow.innerHTML = `Today ${hours}:${minutes} ${ampm} &nbsp;No category`;
}

// Initial session setup
updateTimestamp();

// Master Search Handler
document.getElementById('btn-search').addEventListener('click', () => {
    const input = titleInput.value.trim().toLowerCase();
    
    // Safety check: ensure wordDB exists
    if (typeof wordDB === 'undefined') {
        debugLog.innerText = "DB ERROR: wordDB not found";
        debugLog.style.color = "red"; // Temporary visible error
        return;
    }

    if (!input) return;

    if (/^\d+$/.test(input)) {
        // NUMERIC ROUTE: Length and/or Vowel Positions
        handleNumericInput(input);
    } else if (/^[scm]+$/.test(input)) {
        // SHAPE ROUTE: Morphology (Straight, Curved, Mixed)
        handleShapeInput(input);
    }
    
    finalizeResults();
});

function handleNumericInput(str) {
    // If starting fresh or currentMatches was wiped, start from full wordDB
    let source = (currentMatches.length === 0) ? wordDB : currentMatches;

    // Pattern 1: Initial Search (e.g., 090204 -> length 9, vowels at 2 and 4)
    if (str.length >= 2 && currentMatches.length === 0) {
        const lengthTarget = parseInt(str.substring(0, 2));
        let vowelTargets = [];
        for (let i = 2; i < str.length; i += 2) {
            let pos = parseInt(str.substring(i, i + 2));
            if (!isNaN(pos)) vowelTargets.push(pos);
        }

        currentMatches = wordDB.filter(item => {
            if (item.len !== lengthTarget) return false;
            // Match every vowel position entered
            return vowelTargets.every(vPos => item.v.includes(vPos));
        });
    } 
    // Pattern 2: Refinement (e.g., typing "07" when matches already exist)
    else {
        const additionalVowel = parseInt(str);
        currentMatches = source.filter(item => item.v.includes(additionalVowel));
    }
}

function handleShapeInput(str) {
    if (currentMatches.length === 0) {
        debugLog.innerText = "ENTER LENGTH FIRST";
        return;
    }

    const shapes = str.split(''); // e.g. "msm" -> ["m", "s", "m"]
    currentMatches = currentMatches.filter(item => {
        // Check if the word's shape array matches the input for the length provided
        return shapes.every((char, index) => item.s[index] === char);
    });
}

function finalizeResults() {
    const count = currentMatches.length;
    
    // Reset debug log color to nearly-invisible for performance
    debugLog.style.color = "#0a0a0a";

    if (count > 1) {
        // Show top results in the hidden area
        debugLog.innerText = currentMatches.slice(0, 5).map(i => i.word).join(" | ");
        titleInput.value = ""; 
        titleInput.placeholder = "Tasks"; // Subtle change to show search processed
        if (navigator.vibrate) navigator.vibrate(20); // Single pulse: "Searching..."
    } 
    else if (count === 1) {
        // Word Isolated
        const winner = currentMatches[0].word;
        titleInput.value = "Your word is";
        noteBody.innerText = winner;
        debugLog.innerText = "";
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]); // Triple pulse: "Found it!"
    } else {
        debugLog.innerText = "NO MATCHES";
        debugLog.style.color = "#333"; // Make slightly more visible if failed
    }
}

// Full Reset Logic (Top-Left Back Button)
document.getElementById('btn-reset').addEventListener('click', () => {
    currentMatches = [];
    titleInput.value = "";
    titleInput.placeholder = "Title";
    noteBody.innerText = "";
    debugLog.innerText = "READY";
    debugLog.style.color = "#0a0a0a";
    updateTimestamp();
    if (navigator.vibrate) navigator.vibrate(10);
});
