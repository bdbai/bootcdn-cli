const should = require('chai').should();

const bootcdn = require('../lib/bootcdn');
const libpick = require('../lib/libpick');

let libs = new Map();
let jqueryCountdown = new Set();
let bootstrap = new Set();

describe('libpick', function() {
    this.timeout(15000);

    before(function() {
        return bootcdn.fetchAllLibraries()
        .then(_libs => {
            libs = _libs;
            return bootcdn.fetchLibrary('jquery-countdown');
        }).then(lib => {
            jqueryCountdown = lib;
            return bootcdn.fetchLibrary('bootstrap');
        }).then(lib => {
            bootstrap = lib;
        });
    });

    it('should return one library when given selection exactly matches', function() {
        const result = libpick.pickLibrary('bootstrap', libs, () => {
            throw new Error('Shouldn\'t hesitate.');
        });
        result.name.should.be.equal('bootstrap');
    });

    it('should confirm library when given selection doesn\'t match exactly', function() {
        let cbInvokedCount = 0;

        const result = libpick.pickLibrary('node', libs, options => {
            cbInvokedCount++;

            options.should.be.an('Array');
            options.should.have.lengthOf(2);
            options[0].name.should.equal('node-uuid');
            options[1].name.should.equal('node-waves');

            return options[0].name;
        });

        result.name.should.equal('node-uuid');
        cbInvokedCount.should.equal(1);

    });

    it('should return the first library when confirmation string is empty', function() {
        const result = libpick.pickLibrary('node', libs,
            options => '');

        result.name.should.equal('node-uuid');
    });

    it('should return null if given selection doesn\'t match any library', function() {
        (libpick.pickLibrary('notalibrary', libs,
            () => { throw new Error('Shouldn\'t hesitate.'); }
        ) === null).should.be.true;
    });


    it('should return only latest stable version of jquery-countdown', function() {
        const { latestStable, latestUnstable } = libpick.getLatestVersion(jqueryCountdown);

        latestStable.versionName.should.equal('2.0.2');
        (latestUnstable === undefined).should.be.true;
    });

    it('should return latest stable and unstable version of bootstrap', function() {
        const { latestStable, latestUnstable } = libpick.getLatestVersion(bootstrap);

        latestStable.should.be.an('object');
        latestUnstable.should.be.an('object');
    });

    it('should return one version when given selection exactly matches', function() {
        const result = libpick.pickVersion('3.3.7', bootstrap, () => {
            throw new Error('Shouldn\'t hesitate.');
        });
        result.versionName.should.be.equal('3.3.7');
    });

    it('should confirm version when given selection doesn\'t match exactly', function() {
        let cbInvokedCount = 0;

        const result = libpick.pickVersion('3', bootstrap, options => {
            cbInvokedCount++;

            options.should.be.an('Array');
            options.should.have.lengthOf(16);
            options[0].versionName.should.equal('3.3.7');

            return options[0].versionName;
        });

        result.versionName.should.equal('3.3.7');
        cbInvokedCount.should.equal(1);

    });

    it('should return the first version when confirmation string is empty', function() {
        const result = libpick.pickVersion('3', bootstrap,
            options => '');

        result.versionName.should.equal('3.3.7');
    });

    it('should return null if given selection doesn\'t match any versions', function() {
        (libpick.pickVersion('notaversion', bootstrap,
            () => { throw new Error('Shouldn\'t hesitate.'); }
        ) === null).should.be.true;
    });



});

