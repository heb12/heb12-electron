// Update this version number for every release:
const version = '0-1-0'
let timesChecked = localStorage.getItem('timesChecked');

function checkUpdates() {
  console.log(timesChecked);
  url = 'https://heb12.github.io/updater/desktop/' + version + '.json' + '?' + timesChecked;
  console.log(url);
  if (navigator.onLine) {
    console.log("Checking for updates...");
    timesChecked = Number(timesChecked) + 1;
    localStorage.setItem('timesChecked', timesChecked);
    fetch(url)
        .then(response => response.text())
        .then(result => {
            result = JSON.parse(result);
            if (result != '') {
              console.log(result);
              if (result.outdated == true) {
                console.log('This version is outdated. The newest version is ' + result.newest);
                document.getElementById('latestUpdate').innerHTML = 'Latest version: ' + result.newest + ' (get the newest version from <span class="link">heb12.github.io/update</span>)';
                document.getElementById('latestUpdate').style.display = 'block';
              } else {
                console.log('Using latest version.');
              }
            } else {
                // If for some reason the request returned as blank, it sends an error
                console.log('Error requesting information for program version ' + version);
            }
        });
  } else {
    console.log('No internet connection!');
  }
  return result;
}
