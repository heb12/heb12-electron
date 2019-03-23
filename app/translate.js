/*
Heb12 Desktop is a simple Electron app for reading the Bible.
    Copyright (C) 2018, 2019 The Heb12 Developers <https://heb12.github.io/developers>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const Storage = require('electron-store');
const storage = new Storage();

const supportedLang = [
    "en-US",
    "fr"
]

// Get last language
val = storage.get('language');

if (typeof(val) == 'undefined') {
    val = 'default';
    storage.set('language', 'default');
}

sel = document.getElementById('settings-language');
opts = sel.options;
for (var opt, j = 0; opt = opts[j]; j++) {
    if (opt.value == val) {
        sel.selectedIndex = j;
        break;
    }
}

// Detect when language is changed in settings and re-translate
document.getElementById('settings-language').addEventListener('change', function () {
    storage.set('language', document.getElementById('settings-language').value);
    translate();
});

function ifDefault(data) {
    if (typeof(data) == 'undefined' || data == 'default') {
        // Check if OS is using a supported language
        let usingSupported = false;
        for (let i = 0; i < supportedLang.length; i++) {
            if (navigator.language == supportedLang[i]) {
                data = supportedLang[i];
                usingSupported = true;
            }
        }
        if (!usingSupported) {
            console.log('OS language ' + navigator.language + ' is unknown, using en-US instead.');
            data = 'en-US';
        }
    }
    return data;
}

function translate() {
    let language = document.getElementById('settings-language').value;

    language = ifDefault(language);

    let interface = require('./translations/' + language + '/interface.json');
    let fallbackInterface = require('./translations/en-US/interface.json')

    let elements = document.getElementsByClassName('translate');
    
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];

        // Use fallback if translation is not available
        let text = '';
        if (typeof(interface[element.id]) == 'undefined') {
            text = fallbackInterface[element.id];
        } else {
            text = interface[element.id];
        }
        
        
        // Do special things for a list
        if (typeof(text) == 'object') {
            let options = element.getElementsByTagName('option');
            
            for (let a = 0; a < options.length; a++) {
                options[a].innerText = text[a];
            }
        }
        else {
            element.innerText = text;
        }
    
        
    }

    // Translate books of the Bible
    let booksEl = document.getElementsByClassName('book');
    let books = require('./translations/' + language +'/books.json');
    books = books.books;
            
    for (let i = 0; i < books.length; i++) {
        booksEl[i].innerText = books[i];
    }
}

translate();