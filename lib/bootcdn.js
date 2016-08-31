const fetch = require('node-fetch');
const cheerio = require('cheerio');

const BOOTCDN_URL = 'http://www.bootcdn.cn/';

/**
 * Fetch all libraries from bootcdn main page.
 *
 * @returns {Map} via {Promise}:
 *     {string} name => {object} ( {string} 'name', {string} 'desc', {number} 'star' )
 *
 */
function fetchAllLibraries() {
    return fetch(BOOTCDN_URL).then(res => res.text())
    .then(text => {

        const $ = cheerio.load(text);
        const $packages = $('.package');

        return new Map(Array.from($packages.children()).map(packageEl => {
            const name = $('.package-name', packageEl).text();
            const desc = $('.package-description', packageEl).text();
            let star = parseInt($('.fa-star', packageEl).parent().text());

            if (isNaN(star)) {
                star = null;
            }

            return [name, { name, desc, star }];
        }));

    });
}

/**
 * Fetch cdn urls from all versions of a library.
 *
 * @param {string} library The library name to fetch,
 *     as is shown from bootcdn.cn homepage.
 *
 * @returns {Set} via {Promise}:
 *     {object} ( {string} versionName, {boolean} isUnstable, {Array of {string}} urls )
 *
 */
function fetchLibrary(library = '') {
    if (library === '') {
        throw new TypeError('No library specified.');
    }

    return fetch(BOOTCDN_URL + library + '/').then(res => res.text())
    .then(text => {

        const $ = cheerio.load(text);
        const $versions = $('.version-anchor');
        const $packages = $('.package-version');

        // Ensure versions and packages match
        if ($versions.length !== $packages.length) {
            throw new Error('Versions and packages don\'t match');
        }

        const versions = Array.from($versions);
        const packages = Array.from($packages);

        return new Set(versions.map((versionEl, i) => {
            const versionName = versionEl.attribs['id'];
            const packageEl = packages[i];

            const isUnstable = (versionName.includes('rc') ||
                versionName.includes('alpha') ||
                versionName.includes('beta'));

            const urls = Array.from($('.library-url', packageEl)).map(
                urlEl => urlEl.children[0].data);

            return { versionName, isUnstable, urls };

        }));

    });
}

module.exports = {
    fetchAllLibraries,
    fetchLibrary
}

