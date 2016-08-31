const should = require('chai').should();

const bootcdn = require('../lib/bootcdn');

describe.skip('bootcdn API', function() {
    this.timeout(15000);

    it('should eventually return all available libraries', function() {

        return bootcdn.fetchAllLibraries().then(libs => {
            const bootstrapLib = libs.get('bootstrap');

            libs.should.be.a('Map');
            libs.size.should.be.above(2000);
            (bootstrapLib === null).should.be.false;
            bootstrapLib.name.should.equal('bootstrap');
            bootstrapLib.desc.should.equal('The most popular front-end framework for developing responsive, mobile first projects on the web.');
            bootstrapLib.star.should.be.above(90000);
        });

    });



    it('should eventually return available versions of Bootstrap library', function() {

        return bootcdn.fetchLibrary('bootstrap').then(versions => {
            versions.forEach(version => {

                version.versionName.should.be.a('string');
                version.isUnstable.should.be.a('boolean');
                version.urls.should.be.an('Array');

            });

        });
    });

    it('should throw an exception when no library specified', function() {
        bootcdn.fetchLibrary.bind(null, '').should.throw(TypeError);
    });

    it('should eventually return an empty Set when library doesn\'t exists', function() {
        return bootcdn.fetchLibrary('notexistinglibrary').then(result => {
            result.should.be.a('Set');
            result.size.should.be.equal(0);
        });
    });
});

