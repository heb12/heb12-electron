let bible = require('./bible.json');
let jsonKJV = require('./bible/3John.json');

function getBook(bookGet) {
    var i = 0;
    while (bible[i].id != bookGet) {
        i++;
    }
    return i;
}
function getVerses(reference, version) {
    console.log(version);
    document.getElementById('result').style.display = 'hidden';
    // Renders NET
    if (version == 'net') {
        if (!navigator.onLine) {
            document.getElementById('error').style.display = 'block';
            document.getElementById('error').innerHTML = '<strong>No Internet!</strong> Internet connection is required for some features, including the NET translation.';
            // Set translation back to KJV if NET was chosen while offline
            document.getElementById('translation').selectedIndex = 1;
        } else {
            document.getElementById('error').style.display = 'none';
        }
        url = 'http://labs.bible.org/api/?passage= ' + reference + '&formatting=full';
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
                    document.getElementById('error').style.display = 'block';
                    document.getElementById('error').innerHTML = 'Pardon, there was an error fetching the translation, please try again later';
                    setTimeout(function () { document.getElementById('error').style.display = "none" }, 5000);
                }
                document.getElementById('result').display = 'block';
                return result;
            });
    }
    // Renders KJV
    else {
        var a = chapterAndVerse(reference);
        var theChapter = a.chapter;
        var theBook = a.book.name.split(' ').join('');
        jsonKJV = require('./bible/' + theBook + '.json');
        //jsonKJV = jsonKJV.chapters[0].verses[0]["1"];
        var length = "0";
        var toAdd = '';
        var i = 0;
        for (var i = 0; i < jsonKJV.chapters[Number(theChapter) - 1].verses.length; i++) {
            toAdd = toAdd + '<p class="verse">' + '<b class="vref">' + (i + 1) + '</b> ' + jsonKJV.chapters[Number(theChapter) - 1].verses[i][i + 1] + '</p>';

        }
        document.getElementById('scripture').innerHTML = toAdd;
        document.getElementById('error').style.display = 'none';
    }
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    document.getElementById('result').style.display = 'block';
    document.title = chapterAndVerse(document.getElementById('book').value).book.name + ' ' + document.getElementById('chapter').value + ' - ' + 'Heb12 Bible App';
    localStorage.setItem("lastRef", chapterAndVerse(document.getElementById('book').value).book.name + ' ' + document.getElementById('chapter').value);
    console.log(localStorage.getItem('lastRef'));

}
var chapter, chapterE, books;

function updateText() {
    var translation = document.getElementById('translation').value;
    getVerses(books[getBook(chapterE)].innerHTML + ' ' + chapter.value, translation);

}

// Changes to the next and last chapters
function nextChapter() {
    books = document.getElementsByClassName('book');
    chapter = document.getElementById('chapter');
    chapterE = document.getElementById('book').value;

    if ((bible[getBook(chapterE)].chapters.length > 1) && (chapter.value != (bible[getBook(chapterE)].chapters.length))) {
        chapter.selectedIndex = Number(chapter.value);
        updateText();
    }
}
function lastChapter() {
    books = document.getElementsByClassName('book');
    chapter = document.getElementById('chapter');
    chapterE = document.getElementById('book').value;

    if ((bible[getBook(chapterE)].chapters.length > 1) && (Number(chapter.value) > 1)) {
        chapter.selectedIndex = Number(chapter.value) - 2;
        updateText();
    }
}

// Render the current book's chapters into the chapters dropdown
function loadChapters() {
    books = document.getElementsByClassName('book');
    chapter = document.getElementById('chapter');
    chapterE = document.getElementById('book').value;
    chapter.innerHTML = '';
    if (bible[getBook(chapterE)].chapters.length == 1) {
        chapter.innerHTML = chapter.innerHTML + '<option value=\"1-' + bible[getBook(chapterE)].chapters[0] + '\">' + '1-' + bible[getBook(chapterE)].chapters[0] + '</option>';
    } else {
        for (var x = 1; x < bible[getBook(chapterE)].chapters.length + 1; x++) {
            chapter.innerHTML = chapter.innerHTML + '<option value=\"' + (x) + '\">' + (x) + '</option>';
        }
    }
    updateTranslation();
}
function updateTranslation() {
    localStorage.setItem('translation', document.getElementById('translation').value);
}

// This lets you easily open a chapter
function setChapter(reference) {
    var a = chapterAndVerse(reference);
    var theChapter = a.chapter;
    var theBook = a.book.name.split(' ').join('');
    var val = a.book.name;
    var sel = document.getElementById('book');
    var opts = sel.options;
    for (var opt, j = 0; opt = opts[j]; j++) {
        if (opt.innerHTML == val) {
            sel.selectedIndex = j;
            break;
        }
    }
    loadChapters();
    sel = document.getElementById('chapter');
    sel.selectedIndex = a.chapter - 1;
    updateText();
}

// Increase and decrease text size
var script;
function fontSizePlus() {
    var fontSize = localStorage.getItem('fontSize');
    script = document.getElementById('scripture');
    console.log(String(Number(script.style.fontSize.split('px')[0]) + 1) + 'px');
    script.style.fontSize = String(Number(fontSize.split('px')[0]) + 1) + 'px';
    localStorage.setItem('fontSize', String(Number(fontSize.split('px')[0]) + 1) + 'px');
}
function fontSizeMinus() {
    var fontSize = localStorage.getItem('fontSize');
    script = document.getElementById('scripture');
    console.log(String(Number(script.style.fontSize.split('px')[0]) - 1) + 'px');
    script.style.fontSize = String(Number(fontSize.split('px')[0]) - 1) + 'px';
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

// This closes a specific popup
function closePopup(popup) {
  if (popup == 'alertBox') {
    document.getElementById(popup).style.display = 'none';
  } else {
    document.getElementById(popup).style.display = 'none';
    document.getElementById('backdrop').style.display = 'none';
  }
  document.getElementById('backdrop').style.zIndex = '1001';
}

// This prepares a popup
function openPopup(popup) {
  document.getElementById(popup).style.display = 'block';
  document.getElementById('backdrop').style.display = 'block';
  if (popup == 'alertBox') {
    document.getElementById('backdrop').style.zIndex = '1003';
  }
}

// This is an easy popup maker for either confirming something or just making a notice
function alertYou(say, mode, callback) {
  document.getElementById('alertText').innerText = say;
  if (mode == 'Y/N') {
    document.getElementById('yes').style.display = 'inline-block';
    document.getElementById('no').style.display = 'inline-block';
    openPopup('alertBox');
    document.getElementById('yes').addEventListener('click', function() {
      closePopup('alertBox');
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
    document.getElementById('no').addEventListener('click', function() {
      closePopup('alertBox');
      return 'no';
    });
  } else {
    document.getElementById('okay').style.display = 'inline-block';
    document.getElementById('okay').addEventListener('click', function() {
      closePopup('alertBox');
      return 'okay';
    });
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
    console.log("Finished first-time setup of localStorage");

}
// Resets the program's localStorage
function reset() {
    localStorage.removeItem('fontSize');
    localStorage.setItem('lineSpacing', '25px');
    localStorage.removeItem('firstTime');
    localStorage.setItem("lastRef", 'Hebrews 12');
    return 'Sucessfully reset localStorage';
}



// Retrieves items from localStorage and sets up program


// Checks if this is the first time you opened the program
var firstTime = localStorage.getItem('firstTime');
console.log(firstTime + ' is the value of firstTime in localStorage.');

if (firstTime != 'no') {
    setup();
}


script = document.getElementById('scripture');

// Retrieve last font information and apply it to text
/*window.onload = function() {
    // Font size
    var fontSizers = localStorage.getItem('fontSize');
    script.style.fontSize = fontSizers;
    // Font align
    var textAligned = localStorage.getItem('textAlign');
    script.style.textAlign = textAligned;
}*/

console.log(localStorage.getItem('font') + ' is the font loaded from localStorage');

// Retrieve last font
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

// Translation recovery does not work yet. This code does not affect the program negatively, but it is not operational
var translations = localStorage.getItem('translation');
sel = document.getElementById('translation');
console.log(translations + ' is the translation loaded from localStorage.');

if (translations == 'kjv' || !navigator.onLine) {
    sel.selectedIndex = 1;
}

// Retrieve last chapter viewed
setChapter(localStorage.getItem('lastRef'));
