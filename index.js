const cli = require('./lib/cli');
const commands = require('commander')
    .command('bootcdn-cli [<library[@version]>...]')
    .description('Output library urls from bootcdn.cn wrapped in HTML tags.')
    .option('-r, --raw ', 'don\'t wrap urls in HTML tags.')
    .parse(process.argv);

cli(commands);

