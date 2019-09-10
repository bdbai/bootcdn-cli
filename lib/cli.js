'use strict';

const os = require('os');
const npmlog = require('npmlog');
const chalk = require('chalk');
const read = require('readline-sync');
const copyPaste = require('copy-paste');
const store = require('./store');
const libpick = require('./libpick');

let accumulatedOutput = '';

let cliOptions = {
    raw: false,
    async: false,
    force: false
};

function run(libver) {
    const [ query, ver ] = libver.split('@');

    return store.fetchLibrary(query)
    .then(library => {
        if (library === null) {
            return store.fetchAllLibraries().then(allLibs => libpick.pickLibrary(query, allLibs, () => ''));
        }
        return library;
    }).then(library => library && store.fetchLibrary(library.name))
    .then(library => {
        if (library === null) {
            npmlog.error('Library', 'No match found for %j :(', query);
            return;
        }
        const pickedVersion = libpick.pickVersion(ver || '', library, options => '');
        printFancyVersion(pickedVersion);
    });
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

function yieldOutput(str = '') {
    accumulatedOutput += str + os.EOL;
    return str;
}

function copyAll(caption = 'all') {
    copyPaste.copy(accumulatedOutput);
    npmlog.info(`Copied ${caption}`);
}


function printFancyVersion(asset, isLatest = false) {
    if (!asset) {
        return;
    }

    let printPrompt = chalk.cyan;
    let printOutput = chalk.green;
    let stability = 'stable';

    if (asset.isUnstable) {
        printPrompt = chalk.yellow;
        printOutput = chalk.magenta;
        stability = 'unstable';
    }

    console.error(printPrompt(`Found ${isLatest?'latest ':''}${stability} version ${asset.version}`));
    asset.urls.forEach(url =>
      console.log(
        printOutput(
          yieldOutput(
            wrapUrl(url)))));
    console.error('');
}

function confirmLibraryAsync(lib) {
    npmlog.enableProgress();
    npmlog.http('Index', 'Fetching all libraries...');
    return store.fetchAllLibraries().then(libs => {
        npmlog.disableProgress();
        const pickedLib = libpick.pickLibrary(lib, libs, options => {
            console.log(chalk.cyan('Which one?'));
            options.forEach(lib => console.log(chalk.bold(lib.name)));
            return read.question(`library full name(default to ${options[0].name}):`);
        });
        if (pickedLib === null) {
            npmlog.error('Library', 'No match found for %j :(', lib);
            process.exit(0);
        }

        return store.fetchLibrary(pickedLib.name);
    });
}

function confirmVersion(lib) {

    function pickVersion(versionToPick) {
        const pickedVersion = libpick.pickVersion(versionToPick, lib, options => {
            console.log(chalk.cyan('Which one?'));
            options.forEach(version => console.log(chalk.bold(version.version)));
            return read.question(`version full name(default to ${options[0].version}):`);
        });
        // copy selected version only
        accumulatedOutput = '';
        printFancyVersion(pickedVersion);
        copyAll('selected version');
    }
    while (true) {
        const otherVersion = read.question('Enter a specified version(type all to see all):').trim();
        if (otherVersion === '') {
            break;
        }
        if (otherVersion === 'all') {
            lib.assets.forEach(asset => console.log(chalk.bold(asset.version)));
            continue;
        }

        pickVersion(otherVersion);
    }
}


function pickLibraryAsync({ query, lib }) {
    if (lib === null) {
        // Not found?
        npmlog.warn('Library', '%j not found', lib);
        return confirmLibraryAsync(query);
    } else {
        npmlog.disableProgress();
        return lib;
    }
}

function displayVersion(library) {
    const { latestStable, latestUnstable } = libpick.getLatestVersion(library);
    printFancyVersion(latestUnstable, true);

    // copy latest stable version by default
    accumulatedOutput = '';
    printFancyVersion(latestStable, true);
    copyAll('latest stable version');

    // Ask if user wants more
    confirmVersion(library);
}

function queryLibraryAsync() {
    const query = read.question('Which library to select:').trim();

    if (query === '') {
        npmlog.warn('Input', 'Empty input!');
        process.exit(0);
    }

    npmlog.enableProgress();
    npmlog.http('Library', 'Fetching library info for %j ...', query);
    return store.fetchLibrary(query)
    .then(lib => ({ query, lib }));
}

module.exports = function cli(commands) {
    cliOptions = {
        raw: !!commands.raw,
        async: !!commands.async,
        force: !!commands.force
    };

    const p = cliOptions.force ? store.refresh() : store.init();

    if (commands.args.length === 0) {
        npmlog.info('Using interactive CLI');
        p
          .then(queryLibraryAsync)
          .then(
            pickLibraryAsync,
            err => (npmlog.error('Library', 'Failed fetching library: ' + err), Promise.reject(err)))
          .then(
            displayVersion,
            err => (npmlog.error('Library', 'Failed fetching library: ' + err), Promise.reject(err)))
          .then(() => process.exit(0));
    } else {
        const args = commands.args;
        args.unshift(p);

        Array.from(commands.args).reduce(
          (prev, next) => prev.then(() => run(next)))
        .then(() => {
            if (accumulatedOutput.length > 0) {
                copyAll();
            }
            process.exit(0);
        });
    }

    process.on('unhandledRejection', (r, s) => {
        npmlog.error('Global', r);
        console.error(s);
    });
}

