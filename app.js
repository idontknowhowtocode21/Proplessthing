import wordDB from './wordDB_100k.js';

const inputField = document.getElementById('inputField');
const outputField = document.getElementById('outputField');
const executeBtn = document.getElementById('executeBtn');
const peekStrip = document.getElementById('peekStrip');
const menuTrigger = document.getElementById('menuTrigger');

// Secret Data
let revealTemplate = localStorage.getItem('revTemp') || "Your thought of word is [WORD]";
let customWords = JSON.parse(localStorage.getItem('custWords') || "[]");
let fullDB = [...wordDB, ...customWords];

// Execute Method
executeBtn.onclick = () => {
    const code = inputField.value;
    if (!/^\d{3,}$/.test(code)) return; // Validates 2 digits for length + vowels

    const len = parseInt(code.substring(0, 2));
    const vowels = code.substring(2).split('').map(Number);

    let matches = fullDB.filter(w => w.len === len);
    vowels.forEach(v => { matches = matches.filter(w => w.v.includes(v)); });

    if (matches.length === 1) {
        outputField.value = revealTemplate.replace('[WORD]', matches[0].word.toUpperCase());
    } else if (matches.length > 1) {
        // Peek Strip: Shows first letter + sorted remaining letters (simple anagram)
        peekStrip.innerText = matches.map(m => m.word[0] + m.word.slice(1).split('').sort().join('')).join(' | ');
        
        // Shape Questioning Logic
        for (let i = 0; i < matches[0].len; i++) {
            const shapes = new Set(matches.map(m => m.s[i]));
            if (shapes.size > 1) {
                outputField.value = `Think of the letter at position ${i+1}. Is it mostly straight or curved?`;
                break;
            }
        }
    }
};

// Long Press Logic for Secret Menu
let pressTimer;
menuTrigger.ontouchstart = () => {
    pressTimer = setTimeout(() => {
        document.getElementById('secretMenu').classList.remove('hidden');
    }, 3000); // 3 Seconds
};
menuTrigger.ontouchend = () => clearTimeout(pressTimer);

// Modal Closing & Template Updating
document.getElementById('closeMenu').onclick = () => {
    const newTemp = document.getElementById('templateSetting').value;
    if (newTemp) {
        revealTemplate = newTemp;
        localStorage.setItem('revTemp', newTemp);
    }
    document.getElementById('secretMenu').classList.add('hidden');
};
