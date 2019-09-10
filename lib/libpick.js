'use strict';

/**
 * Pick 0 or 1 item by confirmations.
 *
 * @param {T[]} haystack
 * @param {(options: T[]) => string} confirmCallback re-confirmed selection
 * @param {(needle: T, haystack: Array<T>) => T[]} filterCallback filtered haystack
 *
 * @returns {T | null} the picked item
 * @template T
 */
function pickUntilUnique(haystack, confirmCallback, filterCallback) {
    let selection = '';
    while (haystack.length > 1) {
        selection = confirmCallback(haystack);
        if (selection === '') {
            return haystack[0];
        } else {
            haystack = filterCallback(selection, haystack);
        }
    }

    if (haystack.length === 1) {
        return haystack[0];
    } else {
        return null;
    }
}

/**
 * @typedef {typeof import("./bootcdn")} BootCdn
 * @typedef {ReturnType<BootCdn["fetchLibrary"]> extends Promise<infer T> ? T : never} LibrarySummary
 */

/**
 * Pick one library by a selecting string.
 *
 * @param {string} selection e.g. 'jquery-'
 * @param {Map<string, LibrarySummary>} libs all libraries
 * @param {(options: LibrarySummary[]) => string} confirmCallback re-confirmed selection
 *     will be called if `selection` doesn't match exactly one library.
 *
 * @returns {LibrarySummary | null} the picked library
 */
function pickLibrary(selection, libs, confirmCallback = options => '') {
    if (libs.has(selection)) {
        // Exactly match
        return libs.get(selection);
    }

    /**
     * @param {string} needle
     * @param {[string, LibrarySummary[]]} haystack
     * @returns {[string, LibrarySummary[]]}
     */
    function findMatch(needle, haystack) {
        return haystack.filter(
            ([libname, lib]) => libname.includes(needle)
        );
    }

    let range = findMatch(selection, Array.from(libs));
    if (range.length === 0) {
        // No match found
        return null;
    }


    // More than one library matches
    // Confirm needed

    const result = pickUntilUnique(range,
        haystack => confirmCallback(haystack.map(haystack => haystack[1])),
        findMatch);

    if (result === null) {
        return null;
    } else {
        return result[1];
    }

}

/**
 * @typedef {ReturnType<BootCdn["fetchLibrary"]> extends Promise<infer T> ? T extends null ? never : T : never} LibraryDetail
 * @typedef {LibraryDetail["assets"][0]} LibraryAsset
 */

/**
 * Pick one version by a selection string.
 *
 * @param {string} selection version selection
 * @param {LibraryDetail} lib current library detail
 * @param {(options: LibraryDetail[]) => string} confirmCallback re-confirmed selection
 *     will be called if `selection` doesn't match exactly one version.
 *
 * @returns {LibraryAsset | null} the asset of the selected version
 *
 */
function pickVersion(selection, lib, confirmCallback = options => '') {
    const versions = lib.assets;
    if (selection === '') {
        return versions.find(version => !version.isUnstable);
    }

    /**
     * @param {string} needle 
     * @param {LibraryAsset[]} haystack 
     */
    function match(needle, haystack) {
        const exactlyMatch = haystack.find(asset => asset.version === needle);
        if (typeof exactlyMatch === 'undefined') {
            return haystack.filter(asset => asset.version.startsWith(needle));
        } else {
            return [exactlyMatch];
        }
    }

    const tryMatchResult = match(selection, versions);
    if (tryMatchResult.length === 1) {
        return tryMatchResult[0];
    }

    // Confirm needed
    return pickUntilUnique(tryMatchResult,
         confirmCallback,
         match);
}

/**
 * Get the latest versions from a Set of versions
 * both stable and unstable.
 *
 * @param {LibraryDetail} library
 *
 * @returns {{ latestStable?: LibraryAsset | undefined, latestUnstable?: LibraryAsset | undefined }}
 */
function getLatestVersion(library) {
    const latestStable = library.assets.find(asset => !asset.isUnstable);
    const latestUnstable = library.assets.find(asset => asset.isUnstable);
    return { latestStable, latestUnstable };
}


module.exports = {
    pickLibrary,
    pickVersion,
    getLatestVersion
}

