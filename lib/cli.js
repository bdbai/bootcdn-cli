'use strict';

const npmlog = require('npmlog');
const chalk = require('chalk');
const read = require('readline-sync');
const bootcdn = require('./bootcdn');
const libpick = require('./libpick');

let cliOptions = {
    raw: false,
    async: false
};

function run(libver) {
    const [ lib, ver ] = libver.split('@');
    return queryLibraryAsync(lib, ver, false);
}

function determineSuffix(url) {
    return url.split('.').pop();
}

function wrapUrl(url) {
    if (cliOptions.raw) {
        return url;
    }

    switch (determineSuffix(url)) {
        case 'js':
            const asyncAttr = cliOptions.async ? 'async ' : '';
            return `<script type="text/javascript" ${asyncAttr}src="${url}"></script>`;
        case 'css':
            return `<link rel="stylesheet" href="${url}" />`;
        default:
            return `<!-- ${url} -->`;
    }
}

function printFancyVersion(version, isLatest = false) {
    if (!version) {
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
    console.error(printPrompt('Found ' + (isLatest?'latest ':'') + stability + ' version ' + version.versionName + ':'));
    version.urls.forEach(url => console.log(printOutput(wrapUrl(url))));
    console.error('');
}

function confirmLibraryAsync(lib) {
    npmlog.enableProgress();
    npmlog.http('Index', 'Fetching all libraries...');
    return bootcdn.fetchAllLibraries().then(libs => {
        npmlog.disableProgress();
        const pickedLib = libpick.pickLibrary(lib, libs, options => {
            console.log(chalk.cyan('Which one?'));
            options.forEach(lib => console.log(chalk.bold(lib.name)));
            return read.question(`library full name(default to ${options[0].name}):`);
        });
        if (pickedLib === null) {
            npmlog.error('Library', 'No match found for %j :(', lib);
            return;
        }

        return queryLibraryAsync(pickedLib.name);
    });
}

function confirmVersion(versions) {

    function pickVersion(versionToPick) {
        const pickedVersion = libpick.pickVersion(versionToPick, versions, options => {
            console.log(chalk.cyan('Which one?'));
            options.forEach(version => console.log(chalk.bold(version.versionName)));
            return read.question(`version full name(default to ${options[0].versionName}):`);
        });
        printFancyVersion(pickedVersion);
    }
    while (true) {
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
}


function queryLibraryAsync(lib, versionPreferred = '', needConfirm = true) {
    npmlog.enableProgress();
    npmlog.http('Library', 'Fetching library info for %j ...', lib);
    return bootcdn.fetchLibrary(lib).then(versions => {
        if (versions.size === 0) {
            // Not found?
            npmlog.warn('Library', '%j not found', lib);
            return confirmLibraryAsync(lib);
        } else {
            npmlog.disableProgress();
        }

        if (needConfirm) {
            const { latestStable, latestUnstable } = libpick.getLatestVersion(versions);
            printFancyVersion(latestUnstable, true);
            printFancyVersion(latestStable, true);

            // Ask if user wants more
            confirmVersion(versions);
        } else {
            const pickedVersion = libpick.pickVersion(versionPreferred, versions, options => '');
            printFancyVersion(pickedVersion);
        }

    }, err => {
        npmlog.error('Library', 'Failed fetching library %j', lib);
    });
}

function prompt() {
    const libAns = read.question('Which library to select:').trim();

    if (libAns === '') {
        npmlog.warn('Input', 'Empty input!');
        return;
    }

    return queryLibraryAsync(libAns, '', true);
}

module.exports = function cli(commands) {
    cliOptions = {
        raw: !!commands.raw,
        async: !!commands.async
    };

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

