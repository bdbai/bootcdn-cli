'use strict';

const should = require('chai').should();

const bootcdn = require('../lib/bootcdn');
const libpick = require('../lib/libpick');

let libs = new Map();
let jqueryCountdown = {};
let vue = {};

describe('libpick', function() {
    this.timeout(15000);

    before(function() {
        return bootcdn.fetchAllLibraries()
        .then(_libs => {
            libs = _libs;
            return bootcdn.fetchLibrary('jquery-countdown');
        }).then(lib => {
            jqueryCountdown = lib;
            return bootcdn.fetchLibrary('vue');
        }).then(lib => {
            vue = lib;
        });
    });

    describe('pickLibrary', function() {
        it('should return one library when given selection exactly matches', function() {
            const result = libpick.pickLibrary('vue', libs, () => {
                throw new Error('Shouldn\'t hesitate.');
            });
            result.name.should.be.equal('vue');
        });

        it('should confirm library when given selection doesn\'t match exactly', function() {
            let cbInvokedCount = 0;

            const result = libpick.pickLibrary('node', libs, options => {
                cbInvokedCount++;

                options.should.be.an('Array');
                options.length.should.be.above(2);
                options.includes('node-waves').should.be.false;

                return 'node-waves';
            });

            result.name.should.equal('node-waves');
            cbInvokedCount.should.equal(1);

        });

        it('should return the first library when confirmation string is empty', function() {
            const result = libpick.pickLibrary('node', libs,
                options => '');

            result.name.should.equal('inferno-vnode-flags');
        });

        it('should return null if given selection doesn\'t match any library', function() {
            (libpick.pickLibrary('notalibrary', libs,
                () => { throw new Error('Shouldn\'t hesitate.'); }
            ) === null).should.be.true;
        });
    });

    describe('getLatestVersion', function() {
        it('should return only latest stable version of jquery-countdown', function() {
            const { latestStable, latestUnstable } = libpick.getLatestVersion(jqueryCountdown);

            latestStable.version.should.equal('2.0.2');
            (latestUnstable === undefined).should.be.true;
        });

        it('should return latest stable and unstable version of vue', function() {
            const { latestStable, latestUnstable } = libpick.getLatestVersion(vue);

            latestStable.should.be.an('object');
            latestUnstable.should.be.an('object');
        });
    });

    const VERSION = '0.12.16';
    describe('pickVersion', function() {
        it('should return one version when given selection exactly matches', function() {
            const result = libpick.pickVersion(VERSION, vue, () => {
                throw new Error('Shouldn\'t hesitate.');
            });
            result.version.should.be.equal(VERSION);
        });

        it('should confirm version when given selection doesn\'t match exactly', function() {
            let cbInvokedCount = 0;

            const result = libpick.pickVersion('2', vue, options => {
                cbInvokedCount++;

                options.should.be.an('Array');
                options.length.should.be.above(80);

                return options[0].version;
            });

            cbInvokedCount.should.equal(1);

        });

        it('should return the first version when confirmation string is empty', function() {
            const result = libpick.pickVersion('0.12', vue,
                options => '');

            result.version.should.equal(VERSION);
        });

        it('should return the first stable version when selection is empty', function() {
            const result = libpick.pickVersion('', vue,
                options => '');

            result.should.equal(vue.assets.find(asset => !asset.isUnstable));
        });

        it('should return null if given selection doesn\'t match any versions', function() {
            (libpick.pickVersion('notaversion', vue,
                () => { throw new Error('Shouldn\'t hesitate.'); }
            ) === null).should.be.true;
        });
    });

});

