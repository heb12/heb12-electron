// Require some outside files
let bible = require('./bible.json');
let jsonKJV = require('./bible/Hebrews.json');

// This function gets the book number in bible.json from its name
function getBook(bookGet) {
    var i = 0;
    while (bible[i].id != bookGet) {
        i++;
    }
    return i;
}

function getKJVVerse(bk, chap, vs) {
  jsonKJV = require('./bible/' + bk + '.json');
  console.log(vs);
  return jsonKJV.chapters[Number(chap) - 1].verses[vs - 1][vs];
}
function getNETVerse(bk, chap, vs) {
  if (!navigator.onLine) {
      document.getElementById('nettext').innerHTML = '<em>Check your Internet connection.</em>';
      console.log('Offline ERROR');
  } else {
    console.log('Getting ' + bk + ' ' + chap + ':' + vs + ' in NET translation.');
    url = 'https://labs.bible.org/api/?passage= ' + bk + ' ' + chap + ':' + vs + '&formatting=full';
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

// This puts the correct reference and version requested of the Bible in the 'script' element
async function getVerses(reference, version) {
    console.log(version);
    // Hides the scripture element
    document.getElementById('result').style.display = 'hidden';
    // Renders NET
    if (version == 'net') {
        // If the program is offline it sends an error message
        if (!navigator.onLine) {
            document.getElementById('error').style.display = 'block';
            document.getElementById('error').innerHTML = '<strong>No Internet!</strong> Internet connection is required for some features, including the NET translation.';
            // Set translation back to KJV
            document.getElementById('translation').selectedIndex = 1;
        } else {
            document.getElementById('error').style.display = 'none';
        }
        // This is the url for the NET Bible API. The '&formatting=full' returns the headings and the line spacings of the text
        // Add cors proxy - myed
        url = 'https://cors-anywhere.herokuapp.com/labs.bible.org/api/?passage= ' + reference + '&formatting=full';
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
                // Return the result variable for other use if nessessarry
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
            toAdd = toAdd + '<p class="verse">' + '<b class="vref"' + ' onclick="openVerse(\'' + a.book.name + ' ' + theChapter + ':' + (i + 1) + '\')"' + '>' + (i + 1) + '</b> ' + getKJVVerse(theBook, theChapter, (i + 1)); + '</p>';
            // jsonKJV.chapters[Number(theChapter) - 1].verses[i][i + 1] replaced with getKJVVerse(theBook, theChapter, (i + 1));

        }
        document.getElementById('scripture').innerHTML = toAdd;
        document.getElementById('error').style.display = 'none';
    }

    // Scrolls to the top of the page when the scripture loads
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    // Show the scripture element
    document.getElementById('scripture').style.display = 'block';
    // Set the title of the page to the Bible reference and 'Heb12 Bible App'
    document.title = chapterAndVerse(document.getElementById('book').value).book.name + ' ' + document.getElementById('chapter').value + ' - ' + 'Heb12 Bible App';
    // Save the reference opened in localStorage
    localStorage.setItem("lastRef", chapterAndVerse(document.getElementById('book').value).book.name + ' ' + document.getElementById('chapter').value);
    console.log(localStorage.getItem('lastRef'));
    return result;
}
var chapter, chapterE, books;

// An easy function to update the text according to the dropdown menus
async function updateText() {
    var translation = document.getElementById('translation').value;
    var text2 = await getVerses(books[getBook(chapterE)].innerHTML + ' ' + chapter.value, translation);
}

// Changes to the next and last chapters
function nextChapter() {
    books = document.getElementsByClassName('book');
    chapter = document.getElementById('chapter');
    chapterE = document.getElementById('book').value;

    if ((bible[getBook(chapterE)].chapters.length > 1) && (chapter.value != (bible[getBook(chapterE)].chapters.length))) {
        chapter.selectedIndex = chapter.selectedIndex + 1;
    } else if ((chapter.selectedIndex == bible[getBook(chapterE)].chapters.length - 1) && book.selectedIndex < 65) {
      book.selectedIndex = book.selectedIndex + 1;
      chapterE = document.getElementById('book').value;
      console.log(chapterE);
      loadChapters();
      chapter.selectedIndex = 0;
    }
    updateText();
}
function lastChapter() {
    books = document.getElementsByClassName('book');
    chapter = document.getElementById('chapter');
    chapterE = document.getElementById('book').value;
    // Selected index starts at 0
    if ((bible[getBook(chapterE)].chapters.length > 1) && (chapter.selectedIndex > 0)) {
        chapter.selectedIndex = chapter.selectedIndex - 1;
    } else if ((chapter.selectedIndex == 0) && (book.selectedIndex > 0)) {
      book.selectedIndex = book.selectedIndex - 1;
      chapterE = document.getElementById('book').value;
      loadChapters();
      chapter.selectedIndex = bible[getBook(chapterE)].chapters.length - 1;
    }
    updateText();
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

// This opens a verse popup for a specific verse
function openVerse(ref) {
  openPopup('versePopup');
  var a = chapterAndVerse(ref);
  var theBook = a.book.name;
  var theChapter = a.chapter;
  var vs = a.from;
  document.getElementById('vs').innerText = ref;
  document.getElementById('kjvtext').innerText = getKJVVerse(theBook, theChapter, vs);getNETVerse(theBook, theChapter, vs);
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
  // Set the text for the alertText to the say parimeter
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
  localStorage.setItem('scroll', document.body.scrollTop);
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
    localStorage.removeItem('firstTime');
    console.log("Set firstTime to false. When startup() funtion is run user information will be erased.");
}



// Retrieves items from localStorage and sets up program


// Checks if this is the first time you opened the program
var firstTime = localStorage.getItem('firstTime');
console.log(firstTime + ' is the value of firstTime in localStorage.');

// If this is the first time you opened the program, run the setup function
if (firstTime != 'no') {
    setup();
}

script = document.getElementById('scripture');

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

// Retrieve last translation
var translations = localStorage.getItem('translation');
sel = document.getElementById('translation');
console.log(translations + ' is the translation loaded from localStorage.');

if (translations == 'kjv' || !navigator.onLine) {
    sel.selectedIndex = 1;
}

// Retrieve last chapter viewed
window.onload = function() {
  setChapter(localStorage.getItem('lastRef'));
  setTimeout(function() {
    document.body.scrollTop = localStorage.getItem('scroll');
  }, 200);
}
