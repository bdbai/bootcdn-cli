'use strict';

const fetch = require('node-fetch');

const BOOTCDN_API_URL = 'https://api.bootcdn.cn/';

/**
 * Fetch all libraries from BootCDN API.
 *
 * @returns {Promise<Map<string, {
 *     name: string;
 *     desc: string;
 *     star: number;
 * }>>}
 *
 */
function fetchAllLibraries() {
    return fetch(`${BOOTCDN_API_URL}libraries.min.json`)
    .then(res => res.json())
    .then(libraries => {

        return new Map(libraries.map(lib => {
            const [ name, desc, star ] = lib;
            return [name, { name, desc, star }];
        }));

    });
}

/**
 * Fetch all library names from BootCDN API.
 *
 * @returns {Promise<string>}
 *
 */
function fetchAllLibraryNames() {
    return fetch(`${BOOTCDN_API_URL}names.min.json`)
        .then(res => res.json());
}

/**
 * Fetch package details from BootCDN API.
 *
 * @param {string} library The library name to fetch, as is shown from bootcdn.cn homepage.
 *
 * @returns {Promise<{
 *     name: string;
 *     npmName: string;
 *     version: string;
 *     description: string;
 *     homepage: string;
 *     keywords: string[];
 *     license: string;
 *     repository: {
 *         type: string;
 *         url: string;
 *     };
 *     assets: Array<{
 *         version: string;
 *         files: string[];
 *         urls: string[];
 *         isUnstable: boolean
 *     }>
 * } | null>}
 *
 */
function fetchLibrary(library = '') {
    if (library === '') {
        throw new TypeError('No library specified.');
    }

    return fetch(`${BOOTCDN_API_URL}libraries/${encodeURIComponent(library)}.min.json`)
    .then(res => res.status === 404 ? null : res.json())
    .then(lib => {

        if(!lib) return null;
        const { name } = lib;

        lib.assets.forEach(versionAsset => {
            const { version } = versionAsset;
            versionAsset.urls = versionAsset.files
                .map(path => `https://cdn.bootcss.com/${name}/${version}/${path}`);
            versionAsset.isUnstable = version.includes('rc') ||
                version.includes('alpha') ||
                version.includes('beta');
        });

        return lib;

    });
}

module.exports = {
    fetchAllLibraries,
    fetchAllLibraryNames,
    fetchLibrary
};
