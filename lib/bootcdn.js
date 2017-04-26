'use strict';

const fetch = require('node-fetch');
const cheerio = require('cheerio');

const BOOTCDN_API_URL = 'https://api.bootcdn.cn/';

/**
 * Fetch all libraries from bootcdn main page.
 *
 * @returns {Map} via {Promise}:
 *     {string} name => {object} ( {string} 'name', {string} 'desc', {number} 'star' )
 *
 */
function fetchAllLibraries() {
    return fetch(BOOTCDN_API_URL + 'libraries.min.json').then(res => res.json())
    .then(libraries => {

        return new Map(libraries.map(lib => {
            const name = lib[0];
            const desc = lib[1];
            let star = lib[2];

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

    return fetch(BOOTCDN_API_URL + 'libraries/' + library + '.min.json').then(res => res.status === 404 ? null : res.json())
    .then(lib => {

        if(!lib) return new Set();

        const assets = lib.assets;

        return new Set(assets.map((versionEl, i) => {
            const versionName = versionEl.version;
            const packageEl = versionEl.files;

            const isUnstable = (versionName.includes('rc') ||
                versionName.includes('alpha') ||
                versionName.includes('beta'));

            const urls = packageEl.map(
                urlEl => 'https://cdn.bootcss.com/' + library + '/'+ versionName + '/' + urlEl);

            return { versionName, isUnstable, urls };

        }));

    });
}

module.exports = {
    fetchAllLibraries,
    fetchLibrary
}
