const npmlog = require('npmlog');
const chalk = require('chalk');
const read = require('readline-sync');
const bootcdn = require('./bootcdn');
const libpick = require('./libpick');

function run(package) {
    const [ lib, ver ] = package.split('@');
    return queryLibraryAsync(lib, ver);
}

function printFancyVersion(version, isLatest = false) {
    if (version === null) {
        return;
    }

    let printPrompt = chalk.cyan;
    let printOutput = chalk.green;
    let stability = 'stable';

    if (version.isUnstable) {
        printPrompt = chalk.yellow;
        printOutput = chalk.magenta;
        stability = 'unstable';
    }
    console.log(printPrompt('Found ' + (isLatest?'latest ':'') + stability + ' version ' + version.versionName + ':'));
    version.urls.forEach(url => console.log(printOutput(url)));
    console.log('');
}

function confirmLibraryAsync(lib) {
    npmlog.enableProgress();
    npmlog.http('Index', 'Fetching all libraries...');
    return bootcdn.fetchAllLibraries().then(libs => {
        npmlog.disableProgress();
        const pickedLib = libpick.pickLibrary(lib, libs, options => {
            console.log(chalk.cyan('Which one?'));
            options.forEach(lib => console.log(chalk.bold(lib.name)));
            return read.question('library full name(default to first):');
        });
        if (pickedLib === null) {
            npmlog.error('Library', 'No match found :(');
            return;
        }

        return queryLibraryAsync(pickedLib.name);
    });
}

function confirmVersion(versions, versionPreferred) {

    function pickVersion(versionToPick) {
        const pickedVersion = libpick.pickVersion(versionToPick, versions, options => {
            console.log(chalk.cyan('Which one?'));
            options.forEach(version => console.log(chalk.bold(version.versionName)));
            return read.question('version full name(default to first):');
        });
        printFancyVersion(pickedVersion);
    }
    while (versionPreferred === '') {
        const otherVersion = read.question('Enter a specified version(type all to see all):').trim();
        if (otherVersion === '') {
            break;
        }
        if (otherVersion === 'all') {
            versions.forEach(version => console.log(chalk.bold(version.versionName)));
            continue;
        }

        pickVersion(otherVersion);
    }

    if (versionPreferred !== '') {
        // Version preferred!
        pickVersion(versionPreferred);
    }

}


function queryLibraryAsync(lib, versionPreferred = '') {
    npmlog.enableProgress();
    npmlog.http('Library', 'Fetching library info...');
    return bootcdn.fetchLibrary(lib).then(versions => {
        if (versions.size === 0) {
            // Not found?
            npmlog.warn('Library', '%j not found', lib);
            return confirmLibraryAsync(lib);
        } else {
            npmlog.disableProgress();
        }

        const { latestStable, latestUnstable } = libpick.getLatestVersion(versions);
        printFancyVersion(latestUnstable, true);
        printFancyVersion(latestStable, true);

        // Ask if user wants more
        confirmVersion(versions, versionPreferred);
    }, err => {
        npmlog.error('Library', 'Failed fetching library');
    });
}

function prompt() {
    const libAns = read.question('Which library to select:').trim();

    if (libAns === '') {
        npmlog.warn('Input', 'Empty input!');
        return;
    }

    return queryLibraryAsync(libAns);
}

module.exports = function cli(commands) {
    if (commands.args.length === 0) {
        npmlog.info('Using interactive CLI');
        prompt();
    } else {
        let lastPromise = Promise.resolve();
        for (const p of commands.args) {
            lastPromise = lastPromise.then(() => run(p));
        }
    }
}

