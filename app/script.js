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

 "use strict";

// -----
// Declare functions and variables
// -----

// Require some outside files
let bible = require('./bible.json');
const bibles = require('openbibles');
const request = require('request');
const Store = require('electron-store');
const store = new Store();
const randomVerse = require('random-verse');
const supportedTranslations = require('./translations.json');

// *The* variable for holding the current book and translation being used
let currentBook = 'Genesis';
let currentTranslation = 'en-web'

// Require for locales
let language = document.getElementById('settings-language').value;
language = ifDefault(language);
let bibleBooks = require('./locales/' + language + '/books.json').books;
let ui = require('./locales/' + language + '/interface.json');

document.getElementById('settings-language').addEventListener('change', function () {
    language = document.getElementById('settings-language').value;
    language = ifDefault(language);
    bibleBooks = require('./locales/' + language + '/books.json').books;
    ui = require('./locales/' + language + '/interface.json');

    document.getElementById('book').innerHTML = bibleBooks[getBook(chapterAndVerse(currentBook).book.id)];
});


// List supported translations from OpenBibles
const obtranslations = getTranslations('type', 'openbibles');

// Preferred translations from the above of different languages for scripture excerpts
const preferredTranslations = {
    "en-US":"en-web",
    "fr":"fr-bdc"
}

// This function gets the book number in bible.json (i.e Genesis is 0, Exodus is 1, etc.) from its name
function getBook(bookGet) {
    var i = 0;
    while (bible[i].id != bookGet) {
        i++;
    }
    return i;
} // Print the error if one occurred

// Gets a single verse from the NET
function getNETVerse(ref) {
    if (!navigator.onLine) {
        document.getElementById('en-nettext').innerHTML = '<em>' + ui['error-no-internet-bold'] + '</em>';
        console.log('Offline ERROR. Cannot load NET verse');
    } else {
        document.getElementById('nettext').innerHTML = "<i class=\"fa fa-spinner fa-spin\"></i>";
        let url = 'https://labs.bible.org/api/?passage= ' + ref + '&formatting=plain';
        request(url, function (error, response, body) {
            if (result != '') {
                document.getElementById('nettext').innerHTML = body;
                document.getElementById('error').style.display = 'none';
            }
            console.log('error:', error);
            console.log('statusCode:', response && response.statusCode);
            console.log('body:', body);
        });
    }
}

// This fetches the verses requested and puts it in the 'script' element
async function getVerses(reference, version) {
    document.getElementById('result').style.display = 'hidden';
    document.getElementById('scripture').innerText = "Loading Bible...";
    // Renders NET
    if (version == 'en-net') {
        console.log('Loading NET');
        document.getElementById('scripture').innerHTML = "<div class=\"spinner\"><i class=\"fa fa-spinner fa-spin\"></i></div>";

        // If the program is offline it sends an error message
        if (!navigator.onLine) {
            console.log("ERROR: no Internet connection. Cannot load NET translation.");
            

            document.getElementById('error').style.display = 'block';

            document.getElementById('error').innerHTML = '<strong>' + ui['error-no-internet-bold'] + '</strong> ' + ui['error-no-internet-text'] + '<span class=\"link\" onclick=\"updateTranslation(\' ' + preferredTranslations[language] + '\')\">' + preferredTranslations[language].toUpperCase() + '</span>.';

            document.getElementById('scripture').innerHTML = '';
        } else {
            document.getElementById('error').style.display = 'none';

            // Only load NET while online

            // This is the url for the NET Bible API. The '&formatting=full' returns the headings and the line spacings of the text
            let url = 'https://labs.bible.org/api/?passage= ' + reference + '&formatting=full';
            // Uses the request API to request the scripture from the url above
            request(url, function (error, response, body) {
                if (result != '') {
                    if (currentTranslation == version.toLowerCase) {
                        document.getElementById('scripture').innerHTML = body;
                        document.getElementById('error').style.display = 'none';
                        var bold = document.getElementsByTagName('b');
                        var a = chapterAndVerse(reference);
                        for (let i = 0; i < bold.length; i++) {
                            const element = bold[i];
                            element.addEventListener('click', function() {
                                console.log(reference);

                                openVerse(a.book.name + ' ' + a.chapter + ':' + i);
                            });
                        }
                    }
                } else {
                    console.log('error:', error);
                    console.log('statusCode:', response && response.statusCode);
                    console.log('body:', body);
                    // If for some reason the request returned as blank, it sends an error
                    document.getElementById('error').style.display = 'block';
                    document.getElementById('error').innerHTML = 'Pardon, there was an error fetching the translation, please try again later';
                    // Closes the error after 5 seconds
                    setTimeout(function () { document.getElementById('error').style.display = "none" }, 5000);
                }
            });
        }
    }
    // Renders other
    else {
        console.log('Loading ' + version + ', reference ' + reference + ' into main result.');

        document.getElementById('scripture').innerHTML = bibles(reference, version, true);
        document.getElementById('error').style.display = 'none';
    }

    // Scrolls to the top of the page when the scripture loads
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    // Show the scripture element
    document.getElementById('scripture').style.display = 'block';
    // Set the title of the page to the Bible reference and 'Heb12 Bible'
    document.title = bibleBooks[getBook(chapterAndVerse(currentBook).book.id)]  + ' ' + document.getElementById('chapter').value + ' - ' + 'Heb12 Bible';
    // Save the reference opened into storage
    let saveRef = chapterAndVerse(currentBook).book.name + ' ' + document.getElementById('chapter').value;
    store.set("lastRef", saveRef);
    let history = store.get('history');

    if (history[history.length - 1] !== saveRef) {
        if (history[0] == '') {
            history[0] = saveRef;
        } else {
            history[history.length] = saveRef;
        }
        store.set('history', history)
    }

    // Checks if the current chapter is bookmarked
    if (bookmarkCheck(reference)) {
        document.getElementById('bookmarkIcon').className = 'fas fa-bookmark';
    } else {
        document.getElementById('bookmarkIcon').className = 'far fa-bookmark';
    }

    console.log(store.get('lastRef') + ' is the last reference loaded');
    return result;
}
var chapter, chapters, books, theBook, theChapter;

// An easy function to update the text according to the dropdown menus
async function updateText() {
    theBook = currentBook;
    chapter = document.getElementById('chapter');
    let a = chapterAndVerse(theBook);
    chapters = a.book.chapters;
    getVerses(a.book.name + ' ' + document.getElementById('chapter').value, currentTranslation);
}

// Loads either history or bookmarks
function loadLogs(type) {
    let item = store.get(type);

    let itemEl = document.getElementById(type + 'Items');
    itemEl.innerHTML = '';

    // Only load history or bookmarks if there's actually history or bookmarks
    if (item == '') {
        itemEl.innerText = ui['no-' + type];

        document.getElementById('clearHistoryButton').style.display = 'none';
    }
    else {
        document.getElementById('clearHistoryButton').style.display = 'block';
        
        for (var i = 0; i < item.length; i++) {
            let wrapper = document.createElement('div');
            let itemItem = document.createElement('div');
            let title = document.createElement('h3');
            let para = document.createElement('p');
            let button = document.createElement('button');
            try {
                //console.log(chapterAndVerse(item[i]).book.name + ' ' + chapterAndVerse(item[i]).chapter + ':1', 'web');
                para.innerHTML = bibles(chapterAndVerse(item[i]).book.name + ' ' + chapterAndVerse(item[i]).chapter + ':1', preferredTranslations[language]);
                //console.log(para);
            } catch (e) {
                itemEl.innerHTML = e + itemEl.innerHTML;
            } finally {
                console.log(item[i]);
                title.className = chapterAndVerse(item[i]).book.name + ' ' + item[i].split(' ')[1];
                title.innerHTML = bibleBooks[getBook(chapterAndVerse(item[i]).book.id)] + ' ' + item[i].split(' ')[1];
                
                //console.log(title);
                itemItem.appendChild(title);
                itemItem.appendChild(para);
                wrapper.appendChild(itemItem);
                itemEl.innerHTML = wrapper.innerHTML + itemEl.innerHTML;
                
            }
        }

        // Make individual history items clickable
        let elements = itemEl.getElementsByTagName('div')
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            element.addEventListener('click', function () {
                setChapter(this.getElementsByTagName('h3')[0].className);
                closePopup('history');
            });
        }
    }
}
// Loads bookmarks and history
function loadHistory() {
    loadLogs('bookmarks');
    loadLogs('history');
}

// Finds out if chapter is bookmarked
function bookmarkCheck(ref) {
    let bookmarks = store.get('bookmarks');
    let status = false;
    for (let i = 0; i < bookmarks.length; i++) {
        if (bookmarks[i] == ref) {
            status = true;
        }
    }
    return status;
}

// Toggles bookmarked chapter
function toggleBookmark() {
    let reference = currentBook + ' ' + document.getElementById('chapter').value;
    let bookmarks = store.get('bookmarks');
    // If the chapter is bookmarked, it unbookmarks it, and vice versa
    if (bookmarkCheck(reference)) {
        document.getElementById('bookmarkIcon').className = 'far fa-bookmark';
        // Finds the number in the array which the reference is stored, and deletes it
        for (let i = 0; i < bookmarks.length; i++) {
            if (bookmarks[i] == reference) {
                bookmarks.splice(i, 1);
                store.set('bookmarks', bookmarks);
            }
        }
    } else {
        document.getElementById('bookmarkIcon').className = 'fas fa-bookmark';
        bookmarks[bookmarks.length] = reference;
        store.set('bookmarks', bookmarks);
    }
}

// Changes to the next and last chapters
function nextChapter() {
    books = document.getElementsByClassName('book');
    chapter = document.getElementById('chapter');
    theBook = currentBook;
    let a = chapterAndVerse(theBook);
    chapters = a.book.chapters;

    if ((chapters > 1) && (chapter.value != chapters)) {
        chapter.selectedIndex = chapter.selectedIndex + 1;
    } else if ((chapter.selectedIndex == chapters - 1) && theBook != 'Revelation') {
        setChapter(chapterAndVerse(bible[Number(getBook(a.book.id)) + 1].id).book.id);
        loadChapters();
        chapter.selectedIndex = 0;
    }
    updateText();
}
function lastChapter() {
    books = document.getElementsByClassName('book');
    chapter = document.getElementById('chapter');
    theBook = currentBook;
    let a = chapterAndVerse(theBook);
    chapters = a.book.chapters;
    // Selected index starts at 0
    if ((chapters > 1) && (chapter.selectedIndex > 0)) {
        chapter.selectedIndex = chapter.selectedIndex - 1;
    } else if ((chapter.selectedIndex == 0) && (theBook != 'Genesis')) {
        setChapter(chapterAndVerse(bible[Number(getBook(a.book.id)) - 1].id).book.id);
        theBook = currentBook;
        loadChapters();
        chapter.selectedIndex = chapters - 1;
    }
    updateText();
}

// Render the current book's chapters into the chapters dropdown
function loadChapters() {
    books = document.getElementsByClassName('book');
    chapter = document.getElementById('chapter');
    theBook = currentBook;
    let a = chapterAndVerse(theBook);
    
    chapters = a.book.chapters;
    chapter.innerHTML = '';
    if (chapters == 1) {
        if (theBook === '3 John') {
          chapter.innerHTML = chapter.innerHTML + '<option value=\"1-' + '14' + '\">' + '1-' + '14' + '</option>';
        } else {
          chapter.innerHTML = chapter.innerHTML + '<option value=\"1-' + a.book.versesPerChapter[0] + '\">' + '1-' + a.book.versesPerChapter[0] + '</option>';
        }
    } else {
        for (var x = 1; x < chapters + 1; x++) {
            chapter.innerHTML = chapter.innerHTML + '<option value=\"' + (x) + '\">' + (x) + '</option>';
        }
    }
}
function updateTranslation(theTranslation) {
    console.log(theTranslation);

    currentTranslation = theTranslation;
    
    document.getElementById('translation').innerText = supportedTranslations.translations[currentTranslation].names.codename;
    store.set('translation', currentTranslation);
    updateText();
}

// This lets you easily open a chapter
function setChapter(reference) {
    var a = chapterAndVerse(reference);
    // Sets the book text in header to book name for current language
    document.getElementById('book').innerText = bibleBooks[getBook(a.book.id)];
    currentBook = a.book.name;
    loadChapters();
    document.getElementById('chapter').selectedIndex = a.chapter - 1;
    updateText();
}

// Increase and decrease text size
var script;
function fontSizePlus() {
    var fontSize = store.get('fontSize');
    let x = document.getElementsByClassName('text');
    for (var i = 0; i < x.length; i++) {
        x[i].style.fontSize = String(Number(fontSize.split('px')[0]) + 1) + 'px';
    }
    store.set('fontSize', String(Number(fontSize.split('px')[0]) + 1) + 'px');
    console.log(fontSize);
    
}
function fontSizeMinus() {
    var fontSize = store.get('fontSize');
    let x = document.getElementsByClassName('text');
    for (var i = 0; i < x.length; i++) {
        x[i].style.fontSize = String(Number(fontSize.split('px')[0]) - 1) + 'px';
    }
    store.set('fontSize', String(Number(fontSize.split('px')[0]) - 1) + 'px');
}

// New function for controlling font size directly
function changeFontSize(size) {
    let x = document.getElementsByClassName('text');
    for (let i = 0; i < x.length; i++) {
        x[i].style.fontSize = size.split('px')[0] + 'px';
    }
    store.set('fontSize', size.split('px')[0] + 'px');
    // Ends with 'px' to maintain backwards compatibility with versions 0.3.0 and older
}

function changeFont() {
    store.set('font', document.getElementById('settings-text-font-select').value);
    if (document.getElementById('settings-text-font-select').value == 'default') {
        document.getElementById('scripture').style.fontFamily = 'Arial, Helvetica, sans-serif';
    } else {
        document.getElementById('scripture').style.fontFamily = document.getElementById('settings-text-font-select').value;
    }

}
function changeTheme() {
    store.set('theme', document.getElementById('settings-color-theme-select').value);
    themeChoice = document.getElementById('settings-color-theme-select').value;
    document.getElementById('themeStyle').href = './themes/' + themeChoice +'.css';
}
function changetextAlign() {
    store.set('textAlign', document.getElementById('settings-text-align-select').value);
    document.getElementById('scripture').style.textAlign = document.getElementById('settings-text-align-select').value;
}

// Provides certain items from translations.json depending on factors such as language and type
function getTranslations(identity, value) {
    let translations = [];

    // If value is a string, convert it into an array with one item
    if (typeof(value) == 'string') {
        value = [value];
    }
    if (typeof(identity) == 'string') {
        identity = [identity];
    }

    for (let i = 0; i < supportedTranslations.translationsList.length; i++) {
        const translation = supportedTranslations.translationsList[i];

        let passing = true;
        
        for (let index = 0; index < value.length; index++) {
            if (supportedTranslations.translations[translation][identity[index]] != value[index]) {
                passing = false
            }
        }

        if (passing) {
            translations.push(translation);
        }
        
    }
    
    return translations;
}

// Loads translations into translations popup
function loadTranslations() {
    let lang = document.getElementById('translations-languages').value;
    let translations = getTranslations('language', lang);
    let translationsEl = document.getElementById('translations-available');
    let toAdd = document.createElement('div');

    for (let i = 0; i < translations.length; i++) {
        const translation = translations[i];
        let wrapper = document.createElement('div');
        let element = document.createElement('div');
        element.className = 'translation';

        let title = document.createElement('h3');
        title.innerText = supportedTranslations.translations[translations[i]].names.fullName + ' (' + supportedTranslations.translations[translations[i]].names.codename.toUpperCase() + ')';
        title.id = supportedTranslations.translations[translations[i]].language + '-' + supportedTranslations.translations[translations[i]].names.codename;
        element.appendChild(title);

        let transInfo = document.createElement('div');
        transInfo.className = 'transInfo offline';
        if (supportedTranslations.translations[translations[i]].type == 'online') {
            transInfo.className = 'transInfo online';
        }
        transInfo.innerHTML = supportedTranslations.translations[translations[i]].type;
        element.appendChild(transInfo);

        let description = document.createElement('p');
        description.innerText = supportedTranslations.translations[translations[i]].description;
        element.appendChild(description);

        wrapper.appendChild(element);
        toAdd.appendChild(element);
    }

    translationsEl.innerHTML = toAdd.innerHTML;

    // Make individual translation options clickable
    let elements = document.getElementsByClassName('translation');
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        element.addEventListener('click', function () {
            updateTranslation(this.getElementsByTagName('h3')[0].id);
            closePopup('translations');
        });
    }

}

// This is a function which builds the HTML for supported translations in verse popup
function buildVersesHTML(lang = 'en') {
    let toAdd = '';
    toAdd = toAdd + '<div class="verseBox text"><p><strong>NET</strong></p><p id="en-nettext" class="text verseText"></p></div>'
    let translations = getTranslations(['type', 'language'], ['openbibles', lang]);
    for (let i = 0; i < translations.length; i++) {
        const translation = translations[i];
        let wrapper = document.createElement('div');
        let element = document.createElement('div');
        element.className = 'verseBox text';

        let title = document.createElement('p');
        title.innerHTML = '<strong>' + supportedTranslations.translations[translation].names.codename.toUpperCase();

        let verseBox = document.createElement('p');
        verseBox.id = translation + 'text';
        verseBox.className = 'text verseText';

        element.appendChild(title);
        element.appendChild(verseBox);

        wrapper.appendChild(element);

        toAdd = toAdd + wrapper.innerHTML;
    }

    document.getElementById('verseBoxes').innerHTML = toAdd;
}

// This loads the actual verses into the verse popup
function loadVerse(ref) {    
    document.getElementById('vs').innerText = bibleBooks[getBook(chapterAndVerse(ref).book.id)] + ' ' + ref.split(' ')[ref.split(' ').length-1];

    let lang = document.getElementById('verse-popup-languages').value;
    buildVersesHTML(lang);
    let translations = getTranslations(['language', 'type'], [lang, 'openbibles']);
    for (let i = 0; i < translations.length; i++) {
        let element = translations[i];
        document.getElementById(element + 'text').innerText = bibles(ref, element);
        console.log('Loading translation ' + element + ' into verse lookup popup.');
        
    }
    getNETVerse(ref);
}

// This opens a verse popup for a specific verse
function openVerse(pas) {
    let ref;
    if (pas != '') {
        ref = pas;

    } else {
        ref = randomVerse();
    }
    loadVerse(ref);
    openPopup('versePopup');
    document.getElementById('searchBox').placeholder = ref;
    document.getElementById('searchBox').value = '';
}

// This closes all popups
function closePopups() {
    var popups = document.getElementsByClassName('popup');
    for (var i = 0; i < popups.length; i++) {
        popups[i].style.display = 'none';
    }
    document.getElementById('backdrop').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('backdrop').style.zIndex = '1001';
}

// This closes a specific popup by ID
function closePopup(popup) {
    if (popup == 'alertBox') {
        document.getElementById(popup).style.display = 'none';
    } else {
        document.getElementById(popup).style.display = 'none';
        document.getElementById('backdrop').style.display = 'none';
    }
    document.getElementById('backdrop').style.zIndex = '1001';
}

// This opens a specific popup by ID
function openPopup(popup) {
    document.getElementById(popup).style.display = 'block';
    document.getElementById('backdrop').style.display = 'block';
    if (popup == 'alertBox') {
        document.getElementById('backdrop').style.zIndex = '1003';
    }
}

// Change header when scrolling
document.body.onscroll = function() {
    if (document.scrollingElement.scrollTop > 0) {
        document.getElementById('head').className = 'scroll';
        document.getElementById('result').className = 'scroll';
    } else {
        document.getElementById('head').className = '';
        document.getElementById('result').className = '';
    }
}

// This runs the first time the program is opened
function setup() {
    store.set('fontSize', '18px');
    store.set('lineSpacing', '25px');
    store.set('firstTime', 'no');
    store.set("lastRef", 'Hebrews 4');
    store.set('font', 'default');
    store.set('theme', 'theme1');
    store.set('textAlign', 'left');
    store.set('translation', 'net');
    store.set('history', ['Hebrews 4']);
    store.set('bookmarks', ['Hebrews 4']);
    console.log("Finished first-time setup of storage");

}
// Resets the program's storage
function reset() {
    store.delete('firstTime');
    store.delete('translation');
    console.log("Set firstTime to false. When startup() funtion is run user information will be erased.");
}


// -------
// Retrieves items from storage and sets up program
// -------

// Checks if this is the first time you opened the program
var firstTime = store.get('firstTime');
console.log(firstTime + ' is the value of firstTime in storage.');

// If this is the first time you opened the program, run the setup function
if (firstTime != 'no') {
    setup();
}

script = document.getElementById('scripture');

// Load storage into dropdowns
let val, sel, opts;

// Retrieve last font size
let fontSize = store.get('fontSize');
sel = document.getElementById('fontSize');
opts = sel.options;
for (var opt, j = 0; opt = opts[j]; j++) {
    if (opt.innerText == fontSize) {
        sel.selectedIndex = j;
        break;
    }
    // Maintain backwards compatability with versions 0.3.0 and earlier
    else {
        sel.selectedIndex = 3;
    }
}

// Load font size
changeFontSize(fontSize);

val = store.get('textAlign');
sel = document.getElementById('settings-text-align-select');
opts = sel.options;
for (var opt, j = 0; opt = opts[j]; j++) {
    if (opt.value == val) {
        sel.selectedIndex = j;
        break;
    }
}

// Retrieve last font style
val = store.get('font');
sel = document.getElementById('settings-text-font-select');
opts = sel.options;
for (var opt, j = 0; opt = opts[j]; j++) {
    if (opt.value == val) {
        sel.selectedIndex = j;
        break;
    }
}
if (document.getElementById('settings-text-font-select').value == 'default') {
    document.getElementById('scripture').style.fontFamily = 'Arial, Helvetica, sans-serif';
} else {
    document.getElementById('scripture').style.fontFamily = document.getElementById('settings-text-font-select').value;
}
// Retrieve last textAlign
val = store.get('textAlign');
sel = document.getElementById('settings-text-align-select');
opts = sel.options;
for (var opt, j = 0; opt = opts[j]; j++) {
    if (opt.value == val) {
        sel.selectedIndex = j;
        break;
    }
}
document.getElementById('scripture').style.textAlign = document.getElementById('settings-text-align-select').value;

// Retrieve last theme
val = store.get('theme');

sel = document.getElementById('settings-color-theme-select');
opts = sel.options;
for (var opt, j = 0; opt = opts[j]; j++) {
    if (opt.value == val) {
        sel.selectedIndex = j;
        break;
    }
}
// Set the theme
var themeChoice = document.getElementById('settings-color-theme-select').value;
document.getElementById('themeStyle').href = './themes/' + themeChoice + '.css';

console.log(themeChoice + ' is the theme loaded from storage.');

// Retrieve last translation
let storedTranslations = store.get('translation');
console.log(storedTranslations + ' is the translation loaded from storage.');

updateTranslation(storedTranslations);

window.onload = function() {
    // Retrieve last chapter
    setChapter(store.get('lastRef'));
    let booksEl = document.getElementsByClassName('book');
    
    for (var i = 0; i < booksEl.length; i++) {
        booksEl[i].addEventListener('click', function() {
            setChapter(this.id + ' 1')
            closePopups();
        });
    }

    // Build verse popup HTML
    buildVersesHTML()
    // Setup default verse popup
    let ref = randomVerse();
    loadVerse(ref);

    document.getElementById('searchBox').placeholder = ref;
    document.getElementById('searchBox').value = '';


    // Load translations into translation popup
    loadTranslations();
}
