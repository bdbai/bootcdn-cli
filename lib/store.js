const os = require('os');
const path = require('path');
const bootcdn = require('./bootcdn');
const cacheManager = require('cache-manager');
const cacheFs = require('cache-manager-fs');

let cache = null;

const init = function init() {
    if (cache !== null) return;
    return new Promise(r => {
        cache = cacheManager.caching({
            store: cacheFs,
            options: {
                ttl: 3600 * 24,
                maxsize: 1024 * 2048,
                path: path.join(os.tmpdir(), 'bootcdn-cli'),
                preventfill: false,
                fillcallback: r
            }
        });
    });
};

const refresh = function refresh() {
    if (cache === null) init();
    return new Promise((resolve, reject) => {
        cache.reset(err => {
            if (err) reject(err);
            resolve();
        });
    });
};

function yieldObj(map) {
    return Array.from(map.entries()).map(([k, v]) => [k, v]);
}

function yieldArray(set) {
    return Array.from(set.values());
}

function fetchFromCache(key, fetchAsync, type) {
    if (cache === null) init();
    return new Promise((resolve) => {
        cache.get(key, (err, res) => {
            // Caching error doesn't matter
            cacheHit = res !== null;
            switch (type) {
            case 'map':
              resolve(new Map(res));
              break;
            case 'set':
              resolve(new Set(res));
              break;
            default:
              resolve(res);
            }
        });
    })
    .then(res => cacheHit ? res : fetchAsync())
    .then(res => new Promise((resolve, reject) => {
        if (cacheHit) {
            resolve(res);
        } else {
            let storeObj;
            switch (type) {
            case 'map':
              storeObj = yieldObj(res);
              break;
            case 'set':
              storeObj = yieldArray(res);
              break;
            default:
              storeObj = res;
            }
            cache.set(key, storeObj, () => resolve(res));
        }
    }));
}

module.exports = {
    init,
    refresh,
    fetchAllLibraries: () => fetchFromCache('bootcdn.alllibs', bootcdn.fetchAllLibraries, 'map'),
    fetchLibrary: lib => fetchFromCache(lib, () => bootcdn.fetchLibrary(lib), 'set')
};

