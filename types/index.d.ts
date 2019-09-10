/**
 * Fetch all libraries from BootCDN API.
 *
 * @returns {Promise<Map<string, {
 *   name: string,
 *   desc: string,
 *   star: number
 * }>>}
 *
 */
declare function fetchAllLibraries(): Promise<Map<string, { name: string; desc: string; star: number; }>>;

/**
 * Fetch all library names from BootCDN API.
 *
 * @returns {Promise<string[]>}
 *
 */
declare function fetchAllLibraryNames(): Promise<string[]>;

/**
 * Fetch package details from BootCDN API.
 *
 * @param {string} library The library name to fetch, as is shown from bootcdn.cn homepage.
 *
 * @returns {Promise<{ name: string,
 *   npmName: string, version: string,
 *   description: string,
 *   homepage: string,
 *   keywords: string[],
 *   license: string,
 *   repository: {
 *         type: string,
 *         url: string
 *   },
 *   assets: Array<{
 *         version: string,
 *         files: string[],
 *         urls: string[],
 *         isUnstable: boolean
 *   }>
 * } | null>}
 *
 */
declare function fetchLibrary(library: string): Promise<{ name: string; npmName: string; version: string; description: string; homepage: string; keywords: string[]; license: string; repository: { type: string; url: string; }; assets: { version: string; files: string[]; urls: string[]; isUnstable: boolean; }[]; } | null>;
