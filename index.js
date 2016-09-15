#!/usr/bin/env node
'use strict';

if (require.main === module) {
    const cli = require('./lib/cli');
    const commands = require('commander')
        .command('bootcdn-cli [<library[@version]>...]')
        .description('Output library urls from bootcdn.cn.')
        .option('-r, --raw ', 'don\'t wrap urls in HTML tags.')
        .option('-a, --async ', 'add "async" to <script> tag.')
        .parse(process.argv);

    cli(commands);
} else {
    module.exports = require('./lib/bootcdn');
}

