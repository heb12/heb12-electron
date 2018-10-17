/*
Heb12 Desktop is a simple Electron app for reading the Bible.
    Copyright (C) 2018 The Heb12 Developers <https://heb12.github.io/developers>

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

// Update this version number for every release:
const globalPackageVersion = require('global-package-version');
globalPackageVersion(require('../package.json'), {
    wrapper: 'libName',
    customPackageName: 'version'
});
const version = libName.version;
console.log(version + ' is the version of this program.');
document.getElementById('version').innerText = version;
let timesChecked = localStorage.getItem('timesChecked');
let channel;

function checkUpdates() {
    console.log(document.getElementById('channel').value + ' is the channel.');
    if (document.getElementById('channel').value == 'beta') {
        channel = 'beta';
    } else {
        channel = 'latest';
    }
    console.log(timesChecked);
    url = 'https://heb12.github.io/updater/desktop/' + channel + '.json' + '?' + timesChecked;
    console.log(url);
    if (navigator.onLine) {
        console.log("Checking for updates...");
        timesChecked = Number(timesChecked) + 1;
        localStorage.setItem('timesChecked', timesChecked);
        fetch(url)
            .then(response => response.text())
            .then(result => {
                result = JSON.parse(result);
                if (result != '') {'0.3.0'
                console.log(result);
                if (result.version != version) {
                    console.log('This version is outdated. The newest version is ' + result.newest);
                    document.getElementById('latestUpdate').innerHTML = 'Latest version: ' + result.version + ' (get the newest version from <span class="link">heb12.github.io/update</span>)';
                    document.getElementById('latestUpdate').style.display = 'block';
                } else {
                    console.log('Using latest version.');
                    document.getElementById('latestUpdate').innerHTML = 'Latest version: ' + result.version + ' (up to date)';
                    document.getElementById('latestUpdate').style.display = 'block';
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
