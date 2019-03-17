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

// List supported translations from OpenBibles
const obtranslations = [
    'asv',
    'dby',
    'jub',
    'kj2000',
    'kjv',
    'nheb',
    'rsv',
    'wbt',
    'web',
    'ylt'
]

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
        document.getElementById('nettext').innerHTML = '<em>Check your Internet connection.</em>';
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
    if (version == 'net') {
        console.log('Loading NET');
        document.getElementById('scripture').innerHTML = "<div class=\"spinner\"><i class=\"fa fa-spinner fa-spin\"></i></div>";

        // If the program is offline it sends an error message
        if (!navigator.onLine) {
            console.log("ERROR: no Internet connection. Cannot load NET translation.");
            

            document.getElementById('error').style.display = 'block';
            document.getElementById('error').innerHTML = '<strong>No Internet!</strong> Internet connection is required for some features, including the NET translation. <span class=\"link\" onclick=\"updateTranslation(\'web\')\">Use WEB instead.</span>.';

            document.getElementById('scripture').innerHTML = '';
        } else {
            document.getElementById('error').style.display = 'none';

            // Only load NET while online

            // This is the url for the NET Bible API. The '&formatting=full' returns the headings and the line spacings of the text
            let url = 'https://labs.bible.org/api/?passage= ' + reference + '&formatting=full';
            // Uses the request API to request the scripture from the url above
            request(url, function (error, response, body) {
                if (result != '') {
                    if (document.getElementById('translation').innerText.toLowerCase == version.toLowerCase) {
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
    document.title = chapterAndVerse(document.getElementById('book').innerText).book.name + ' ' + document.getElementById('chapter').value + ' - ' + 'Heb12 Bible';
    // Save the reference opened into storage
    let saveRef = chapterAndVerse(document.getElementById('book').innerText).book.name + ' ' + document.getElementById('chapter').value;
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
    theBook = document.getElementById('book').innerText;
    let a = chapterAndVerse(theBook);
    chapters = a.book.chapters;
    var translation = document.getElementById('translation').innerText.toLowerCase();
    var text2 = await getVerses(a.book.name + ' ' + chapter.value, translation);
}

// Loads either history or bookmarks
function loadLogs(type) {
    let item = store.get(type);

    let itemEl = document.getElementById(type + 'Items');
    itemEl.innerHTML = '';

    // Only load history or bookmarks if there's actually history or bookmarks
    if (item == '') {
        itemEl.innerText = 'You currently have no ' + type + '.';

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
                para.innerHTML = bibles(chapterAndVerse(item[i]).book.name + ' ' + chapterAndVerse(item[i]).chapter + ':1', 'web');
                //console.log(para);
            } catch (e) {
                itemEl.innerHTML = e + itemEl.innerHTML;
            } finally {
                title.innerHTML = item[i];
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
                setChapter(this.getElementsByTagName('h3')[0].innerText);
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
    let reference = document.getElementById('book').innerText + ' ' + document.getElementById('chapter').value;
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
    theBook = document.getElementById('book').innerText;
    let a = chapterAndVerse(theBook);
    chapters = a.book.chapters;

    if ((chapters > 1) && (chapter.value != chapters)) {
        chapter.selectedIndex = chapter.selectedIndex + 1;
    } else if ((chapter.selectedIndex == chapters - 1) && theBook != 'Revelation') {
        document.getElementById('book').innerText = chapterAndVerse(bible[Number(getBook(a.book.id)) + 1].id).book.name;
        theBook = document.getElementById('book').innerText;
        console.log(theBook);
        loadChapters();
        chapter.selectedIndex = 0;
    }
    updateText();
}
function lastChapter() {
    books = document.getElementsByClassName('book');
    chapter = document.getElementById('chapter');
    theBook = document.getElementById('book').innerText;
    let a = chapterAndVerse(theBook);
    chapters = a.book.chapters;
    // Selected index starts at 0
    if ((chapters > 1) && (chapter.selectedIndex > 0)) {
        chapter.selectedIndex = chapter.selectedIndex - 1;
    } else if ((chapter.selectedIndex == 0) && (theBook != 'Genesis')) {
        document.getElementById('book').innerText = chapterAndVerse(bible[Number(getBook(a.book.id)) - 1].id).book.name;
        theBook = document.getElementById('book').innerText;
        loadChapters();
        chapter.selectedIndex = chapters - 1;
    }
    updateText();
}

// Render the current book's chapters into the chapters dropdown
function loadChapters() {
    books = document.getElementsByClassName('book');
    chapter = document.getElementById('chapter');
    theBook = document.getElementById('book').innerText;
    theBook = document.getElementById('book').innerText;
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

    document.getElementById('translation').innerText = theTranslation;
    store.set('translation', theTranslation);
    updateText();
}

// This lets you easily open a chapter
function setChapter(reference) {
    var a = chapterAndVerse(reference);
    document.getElementById('book').innerText = a.book.name;
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
    store.set('font', document.getElementById('font').value);
    if (document.getElementById('font').value == 'default') {
        document.getElementById('scripture').style.fontFamily = 'Arial, Helvetica, sans-serif';
    } else {
        document.getElementById('scripture').style.fontFamily = document.getElementById('font').value;
    }

}
function changeTheme() {
    store.set('theme', document.getElementById('theme').value);
    themeChoice = document.getElementById('theme').value;
    document.getElementById('themeStyle').href = './themes/' + themeChoice +'.css';
}
function changetextAlign() {
    store.set('textAlign', document.getElementById('textAlign').value);
    document.getElementById('scripture').style.textAlign = document.getElementById('textAlign').value;
}

// This opens a verse popup for a specific verse
function openVerse(pas) {
    let ref;
    if (pas != '') {
        ref = pas;

    } else {
        ref = randomVerse();
    }
    openPopup('versePopup');
    document.getElementById('vs').innerText = ref;

    for (let i = 0; i < obtranslations.length; i++) {
        let element = obtranslations[i];
        document.getElementById(element + 'text').innerText = bibles(ref, element);
        console.log('Loading translation ' + element + ' into verse lookup popup.');
        
    }
    getNETVerse(ref);
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
sel = document.getElementById('textAlign');
opts = sel.options;
for (var opt, j = 0; opt = opts[j]; j++) {
    if (opt.value == val) {
        sel.selectedIndex = j;
        break;
    }
}

// Retrieve last font style
val = store.get('font');
sel = document.getElementById('font');
opts = sel.options;
for (var opt, j = 0; opt = opts[j]; j++) {
    if (opt.value == val) {
        sel.selectedIndex = j;
        break;
    }
}
if (document.getElementById('font').value == 'default') {
    document.getElementById('scripture').style.fontFamily = 'Arial, Helvetica, sans-serif';
} else {
    document.getElementById('scripture').style.fontFamily = document.getElementById('font').value;
}
// Retrieve last textAlign
val = store.get('textAlign');
sel = document.getElementById('textAlign');
opts = sel.options;
for (var opt, j = 0; opt = opts[j]; j++) {
    if (opt.value == val) {
        sel.selectedIndex = j;
        break;
    }
}
document.getElementById('scripture').style.textAlign = document.getElementById('textAlign').value;

// Retrieve last theme
val = store.get('theme');

sel = document.getElementById('theme');
opts = sel.options;
for (var opt, j = 0; opt = opts[j]; j++) {
    if (opt.value == val) {
        sel.selectedIndex = j;
        break;
    }
}
// Set the theme
var themeChoice = document.getElementById('theme').value;
document.getElementById('themeStyle').href = './themes/' + themeChoice + '.css';

console.log(themeChoice + ' is the theme loaded from storage.');

// Retrieve last translation
var translations = store.get('translation');
console.log(translations + ' is the translation loaded from storage.');

document.getElementById('translation').innerText = translations;

window.onload = function() {
    // Retrieve last chapter
    setChapter(store.get('lastRef'));
    let booksEl = document.getElementsByClassName('book');
    
    for (var i = 0; i < booksEl.length; i++) {
        booksEl[i].addEventListener('click', function() {setChapter(this.innerText + ' 1');closePopups()});
    }

    // Setup default verse popup
    let ref = randomVerse();
    document.getElementById('vs').innerText = ref;

    for (let i = 0; i < obtranslations.length; i++) {
        let element = obtranslations[i];
        document.getElementById(element + 'text').innerText = bibles(ref, element);
        //console.log('Loading translation ' + element + ' into verse lookup popup.');
        
    }
    console.log('Loaded text into verse popup.')
    getNETVerse(ref);
    document.getElementById('searchBox').placeholder = ref;
    document.getElementById('searchBox').value = '';
}
