'use strict';

/**
 * Pick 0 or 1 item by confirmations.
 *
 * @param {Array of any} haystack
 * @callback {Array of any} options => {string} re-confirmed selection
 * @callback {any} needle, {Array of any} haystack => {Array of any} filtered haystack
 *
 * @returns the picked item
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
 * Pick one library by a selecting string.
 *
 * @param {string} selection e.g. 'jquery-'
 * @param {Map} libs all libraries
 * @callback {Array of {Object} library} options => {string} re-confirmed selection
 *     will be called if `selection` doesn't match exactly one library.
 *
 * @returns the picked library
 */
function pickLibrary(selection, libs, confirmCallback = options => '') {
    if (libs.has(selection)) {
        // Exactly match
        return libs.get(selection);
    }

    function findMatch(needle, haystack) {
        return haystack.filter(
            ([libname, lib]) => libname.startsWith(needle)
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
 * Pick one version by a selection string.
 *
 * @see pickLibrary
 *
 */
function pickVersion(selection, versions, confirmCallback = options => '') {
    if (selection === '') {
        return Array.from(versions.values())
            .find(version => !version.isUnstable);
    }

    function match(needle, haystack) {
        const exactlyMatch = haystack.find(version => version.versionName === needle);
        if (typeof exactlyMatch === 'undefined') {
            return haystack.filter(version => version.versionName.startsWith(needle));
        } else {
            return [exactlyMatch];
        }
    }

    const tryMatchResult = match(selection, Array.from(versions.values()));
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
 * @param {Set} versions
 *
 * @returns {object ({object | undefined} latestStable, {object | undefined} latestUnstable) }
 */
function getLatestVersion(versions) {
    const latestStable = Array.from(versions.values())
        .find(version => !version.isUnstable);
    const latestUnstable = Array.from(versions.values())
        .find(version => version.isUnstable);
    return { latestStable, latestUnstable };
}


module.exports = {
    pickLibrary,
    pickVersion,
    getLatestVersion
}

