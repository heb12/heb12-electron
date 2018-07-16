// -----
// Declare functions and variables
// -----

// Require some outside files
let bible = require('./bible.json');
const bibles = require('openbibles');

// This function gets the book number in bible.json (i.e Genesis is 0, Exodus is 1, etc.) from its name
function getBook(bookGet) {
    var i = 0;
    while (bible[i].id != bookGet) {
        i++;
    }
    return i;
}

// Gets a single verse from the NET
function getNETVerse(ref) {
    if (!navigator.onLine) {
        document.getElementById('nettext').innerHTML = '<em>Check your Internet connection.</em>';
        console.log('Offline ERROR');
    } else {
    url = 'https://labs.bible.org/api/?passage= ' + ref + '&formatting=plain';
    fetch(url, {
        mode: 'cors'
    })
        .then(response => response.text())
        .then(result => {
            if (result != '') {
                document.getElementById('nettext').innerHTML = result;
                document.getElementById('error').style.display = 'none';
            }
            return result;
        });
    }
}

// This fetches the verses requested and puts it in the 'script' element
async function getVerses(reference, version) {
    console.log(version);
    document.getElementById('result').style.display = 'hidden';
    // Renders NET
    if (version == 'net') {
        console.log('Loading NET');
        
        // If the program is offline it sends an error message
        if (!navigator.onLine) {
            document.getElementById('error').style.display = 'block';
            document.getElementById('error').innerHTML = '<strong>No Internet!</strong> Internet connection is required for some features, including the NET translation.';
            // Set translation back to KJV
            document.getElementById('translation').innerText = 'kjv';
            updateTranslation();
        } else {
            document.getElementById('error').style.display = 'none';
        }
        // This is the url for the NET Bible API. The '&formatting=full' returns the headings and the line spacings of the text
        // Add cors proxy - myed
        //url = 'https://cors-anywhere.herokuapp.com/labs.bible.org/api/?passage= ' + reference + '&formatting=full';
        url = 'https://labs.bible.org/api/?passage= ' + reference + '&formatting=full';
        // Uses the fetch API to request the scripture from the url above
        fetch(url, {
            mode: 'cors'
        })
            .then(response => response.text())
            .then(result => {
                if (result != '') {
                    document.getElementById('scripture').innerHTML = result;
                    //document.getElementById('reference').innerHTML = reference;
                    document.getElementById('error').style.display = 'none';
                } else {
                    // If for some reason the request returned as blank, it sends an error
                    document.getElementById('error').style.display = 'block';
                    document.getElementById('error').innerHTML = 'Pardon, there was an error fetching the translation, please try again later';
                    // Closes the error after 5 seconds
                    setTimeout(function () { document.getElementById('error').style.display = "none" }, 5000);
                }
                var bold = document.getElementsByTagName('b');
                var a = chapterAndVerse(reference);
                    for (let i = 0; i < bold.length; i++) {
                        const element = bold[i];
                        element.addEventListener('click', function() {
                            console.log(reference);
                            
                            openVerse(a.book.name + ' ' + a.chapter + ':' + i);
                        });
                    }
                return result;
            });
    }
    // Renders other
    else {
        console.log('Loading ' + version);
        
        document.getElementById('scripture').innerHTML = bibles(reference, version, true);
        document.getElementById('error').style.display = 'none';
    }

    // Scrolls to the top of the page when the scripture loads
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    // Show the scripture element
    document.getElementById('scripture').style.display = 'block';
    // Set the title of the page to the Bible reference and 'Heb12 Bible App'
    document.title = chapterAndVerse(document.getElementById('book').innerText).book.name + ' ' + document.getElementById('chapter').value + ' - ' + 'Heb12 Bible App';
    // Save the reference opened into localStorage
    localStorage.setItem("lastRef", chapterAndVerse(document.getElementById('book').innerText).book.name + ' ' + document.getElementById('chapter').value);
    console.log(localStorage.getItem('lastRef'));
    return result;
}
var chapter, chapters, books, theBook, theChapter;

// An easy function to update the text according to the dropdown menus
async function updateText() {
    theBook = document.getElementById('book').innerText;
    a = chapterAndVerse(theBook);
    chapters = a.book.chapters;
    var translation = document.getElementById('translation').innerText.toLowerCase();
    var text2 = await getVerses(a.book.name + ' ' + chapter.value, translation);
}

// Changes to the next and last chapters
function nextChapter() {
    books = document.getElementsByClassName('book');
    chapter = document.getElementById('chapter');
    theBook = document.getElementById('book').innerText;
    a = chapterAndVerse(theBook);
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
    a = chapterAndVerse(theBook);
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
    a = chapterAndVerse(theBook);
    console.log(a);
    chapters = a.book.chapters;
    chapter.innerHTML = '';
    if (chapters == 1) {
        chapter.innerHTML = chapter.innerHTML + '<option value=\"1-' + a.book.versesPerChapter[0] + '\">' + '1-' + a.book.versesPerChapter[0] + '</option>';
    } else {
        for (var x = 1; x < chapters + 1; x++) {
            chapter.innerHTML = chapter.innerHTML + '<option value=\"' + (x) + '\">' + (x) + '</option>';
        }
    }
}
function updateTranslation(theTranslation) {
    console.log(theTranslation);
    
    document.getElementById('translation').innerText = theTranslation;
    localStorage.setItem('translation', theTranslation);
    updateText();
}

// This lets you easily open a chapter
function setChapter(reference) {
    var a = chapterAndVerse(reference);
    console.log(reference);
    document.getElementById('book').innerText = a.book.name;
    loadChapters();
    document.getElementById('chapter').selectedIndex = a.chapter - 1;
    updateText();
}

// Increase and decrease text size
var script;
function fontSizePlus() {
    var fontSize = localStorage.getItem('fontSize');
    script = document.getElementById('scripture');
    console.log(String(Number(script.style.fontSize.split('px')[0]) + 1) + 'px');
    script.style.fontSize = String(Number(fontSize.split('px')[0]) + 1) + 'px';
    let x = document.getElementsByClassName('text');
    for (var i = 0; i < x.length; i++) {
        x[i].style.fontSize = String(Number(fontSize.split('px')[0]) + 1) + 'px';
    }
    localStorage.setItem('fontSize', String(Number(fontSize.split('px')[0]) + 1) + 'px');
}
function fontSizeMinus() {
    var fontSize = localStorage.getItem('fontSize');
    script = document.getElementById('scripture');
    console.log(String(Number(script.style.fontSize.split('px')[0]) - 1) + 'px');
    script.style.fontSize = String(Number(fontSize.split('px')[0]) - 1) + 'px';
    let x = document.getElementsByClassName('text');
    for (var i = 0; i < x.length; i++) {
        x[i].style.fontSize = String(Number(fontSize.split('px')[0]) - 1) + 'px';
    }
    localStorage.setItem('fontSize', String(Number(fontSize.split('px')[0]) - 1) + 'px');
}

function changeFont() {
    localStorage.setItem('font', document.getElementById('font').value);
    if (document.getElementById('font').value == 'default') {
        document.getElementById('scripture').style.fontFamily = 'Arial, Helvetica, sans-serif';
    } else {
        document.getElementById('scripture').style.fontFamily = document.getElementById('font').value;
    }

}
function changeTheme() {
    localStorage.setItem('theme', document.getElementById('theme').value);
    themeChoice = document.getElementById('theme').value;
    document.getElementById('themeStyle').href = './themes/' + themeChoice +'.css';
}
function changetextAlign() {
    localStorage.setItem('textAlign', document.getElementById('textAlign').value);
    document.getElementById('scripture').style.textAlign = document.getElementById('textAlign').value;
}
function changeLineBreaks() {
    let linebreaks = document.getElementById('lineBreaks').value;
    localStorage.setItem('lineBreaks', linebreaks);
    if (linebreaks == 'false') {
        document.getElementById('scripture').className = 'noBreaks';
    } else {
        document.getElementById('scripture').className = '';
    }
    
}

// This opens a verse popup for a specific verse
function openVerse(ref) {
    if (ref != '') {
        openPopup('versePopup');
        document.getElementById('vs').innerText = ref;
        document.getElementById('asvtext').innerText = bibles(ref, 'asv');
        document.getElementById('dbytext').innerText = bibles(ref, 'darby');
        document.getElementById('jubtext').innerText = bibles(ref, 'jub');
        document.getElementById('kj2000text').innerText = bibles(ref, 'kj2000');
        document.getElementById('kjvtext').innerText = bibles(ref, 'kjv');
        document.getElementById('nhebtext').innerText = bibles(ref, 'nheb');
        getNETVerse(ref);
        document.getElementById('rsvtext').innerText = bibles(ref, 'rsv');
        document.getElementById('wbttext').innerText = bibles(ref, 'wbt');
        document.getElementById('webtext').innerText = bibles(ref, 'web');
        document.getElementById('ylttext').innerText = bibles(ref, 'ylt');
        document.getElementById('searchBox').placeholder = ref;
        document.getElementById('searchBox').value = '';
    }
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

// A script for either alerting or asking for a response. This is not used anywhere currently.
function alertYou(say, mode, callback) {
    document.getElementById('alertText').innerText = say;
    // If the mode is a confirming of an action
    if (mode == 'Y/N') {
        // Show the elements for Y/N
        document.getElementById('yes').style.display = 'inline-block';
        document.getElementById('no').style.display = 'inline-block';
        // Open the alertBox
        openPopup('alertBox');
        // If the 'yes' button is clicked run this function
        document.getElementById('yes').addEventListener('click', function() {
        // Close alertBox
        closePopup('alertBox');
        // Choose which function to run
        switch (callback) {
            case 'reset':
            reset();
            setup();
            break;
            default:
            break;
        }
        return 'yes';
        });
        // Cancel everything when no is clicked
        document.getElementById('no').addEventListener('click', function() {
            closePopup('alertBox');
            return 'no';
        });
        // 'Okay' is a simple dialoge box to explain something
    } else {
        document.getElementById('okay').style.display = 'inline-block';
        document.getElementById('okay').addEventListener('click', function() {
        closePopup('alertBox');
        return 'okay';
        });
    }
}
// Save scroll position
document.body.onscroll = function() {
    localStorage.setItem('scroll', document.scrollingElement.scrollTop);
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
    localStorage.setItem('fontSize', '17px');
    localStorage.setItem('lineSpacing', '25px');
    localStorage.setItem('firstTime', 'no');
    localStorage.setItem("lastRef", 'Hebrews 12');
    localStorage.setItem('font', 'default');
    localStorage.setItem('theme', 'theme1');
    localStorage.setItem('textAlign', 'left');
    localStorage.setItem('translation', 'net');
    localStorage.setItem('lineBreaks', 'true');
    console.log("Finished first-time setup of localStorage");

}
// Resets the program's localStorage
function reset() {
    localStorage.removeItem('firstTime');
    console.log("Set firstTime to false. When startup() funtion is run user information will be erased.");
}


// -------
// Retrieves items from localStorage and sets up program
// -------

// Checks if this is the first time you opened the program
var firstTime = localStorage.getItem('firstTime');
console.log(firstTime + ' is the value of firstTime in localStorage.');

// If this is the first time you opened the program, run the setup function
if (firstTime != 'no') {
    setup();
}

script = document.getElementById('scripture');

console.log(localStorage.getItem('font') + ' is the font loaded from localStorage');

// Retrieve last font style
var val = localStorage.getItem('font');
var sel = document.getElementById('font');
var opts = sel.options;
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
val = localStorage.getItem('textAlign');
sel = document.getElementById('textAlign');
opts = sel.options;
for (var opt, j = 0; opt = opts[j]; j++) {
    if (opt.value == val) {
        sel.selectedIndex = j;
        break;
    }
}
document.getElementById('scripture').style.textAlign = document.getElementById('textAlign').value;

// Retrieve last lineBreaks
val = localStorage.getItem('lineBreaks');
sel = document.getElementById('lineBreaks');
opts = sel.options;
for (var opt, j = 0; opt = opts[j]; j++) {
    if (opt.value == val) {
        sel.selectedIndex = j;
        break;
    }
}
if (val == 'false') {
    document.getElementById('scripture').className = 'noBreaks';
} else {
    document.getElementById('scripture').className = '';
}

// Retrieve last theme
val = localStorage.getItem('theme');
console.log(val + ' is the theme stored in localStorage.');

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

// Retrieve last translation
var translations = localStorage.getItem('translation');
console.log(translations + ' is the translation loaded from localStorage.');

document.getElementById('translation').innerText = translations;

window.onload = function() {
    // Retrieve last chapter
    setChapter(localStorage.getItem('lastRef'));
    let booksEl = document.getElementsByClassName('book');
    console.log(booksEl);
    for (var i = 0; i < booksEl.length; i++) {
        booksEl[i].addEventListener('click', function() {setChapter(this.innerText + ' 1');closePopups()});
    }
    // After 200 miliseconds (about the time it takes to fetch the NET) it scrolls to the position when it was closed
    setTimeout(function() {
        document.body.scrollTop = localStorage.getItem('scroll');
    }, 200);
}
