import wordDB from './wordDB_100k.js';

const noteTitle = document.getElementById('noteTitle');
const noteBody = document.getElementById('noteBody');
const secretTrigger = document.getElementById('secretTrigger');
const peekStrip = document.getElementById('peekStrip');

// Persistent Settings
let revealTemplate = localStorage.getItem('revealTemplate') || "The word I think you are thinking of is [WORD]";
let customWords = JSON.parse(localStorage.getItem('customWords') || "[]");

const fullDB = [...wordDB, ...customWords];

// Trigger the Method
secretTrigger.addEventListener('click', performReveal);

function performReveal() {
    const val = noteTitle.value.trim();
    if (!/^\d{3,}$/.test(val)) return;

    const len = parseInt(val.substring(0, 2));
    const vowels = val.substring(2).split('').map(Number);

    let matches = fullDB.filter(w => w.len === len);
    
    // Filter by vowel positions
    vowels.forEach(pos => {
        matches = matches.filter(w => w.v.includes(pos));
    });

    if (matches.length === 1) {
        noteBody.value = revealTemplate.replace('[WORD]', matches[0].word.toUpperCase());
        peekStrip.innerText = "";
    } else if (matches.length > 1) {
        // Subtle Anagram Peek
        const peekText = matches.map(m => m.word[0] + m.word.slice(1).split('').sort().join('')).join(" | ");
        peekStrip.innerText = peekText;
        
        // Shape Branching
        findDifferentiatingShape(matches);
    }
}

function findDifferentiatingShape(matches) {
    for (let i = 0; i < matches[0].len; i++) {
        const shapes = matches.map(m => m.s[i]);
        if (new Set(shapes).size > 1) {
            noteBody.value = `Describe the visual shape of the letter at position ${i+1}...`;
            break;
        }
    }
}

// Secret Window Logic (Long press Menu)
document.querySelector('.menu-icon').addEventListener('touchstart', (e) => {
    let timer = setTimeout(() => {
        document.getElementById('secretWindow').classList.remove('hidden');
    }, 2000);
    e.target.addEventListener('touchend', () => clearTimeout(timer));
});
