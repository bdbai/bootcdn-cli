'use strict';

const chai = require('chai');
const should = chai.should();
const expect = chai.expect;

const bootcdn = require('../lib/bootcdn');

describe('bootcdn API', function() {
    this.timeout(15000);

    it('should eventually return all available libraries', function() {

        return bootcdn.fetchAllLibraries().then(libs => {
            const bootstrapLib = libs.get('twitter-bootstrap');

            libs.should.be.a('Map');
            libs.size.should.be.above(2000);
            (bootstrapLib === null).should.be.false;
            bootstrapLib.name.should.equal('twitter-bootstrap');
            bootstrapLib.desc.should.equal('The most popular front-end framework for developing responsive, mobile first projects on the web.');
            bootstrapLib.star.should.be.above(90000);
        });

    });

    it('should eventually return all library names', function() {

        return bootcdn.fetchAllLibraryNames().then(libs => {
            libs.should.be.an('Array');
            libs.length.should.be.above(2000);
            libs.forEach(lib => lib.should.be.a('string'))
        });

    });

    it('should return null when a library does not exists', function() {
        return bootcdn.fetchLibrary('an awesome library that could never exist').then(result => {
            expect(result).be.a('null')
        })
    });

    it('should eventually return available versions of Bootstrap library', function() {

        return bootcdn.fetchLibrary('twitter-bootstrap').then(library => {
            library.name.should.be.a('string');
            library.npmName.should.be.a('string');
            library.version.should.be.a('string');
            library.description.should.be.a('string');
            library.homepage.should.be.a('string');
            library.keywords.should.be.an('array');
            library.keywords.forEach(kw => kw.should.be.a('string'));
            library.repository.should.exist;
            library.repository.type.should.be.a('string');
            library.repository.url.should.be.a('string');
            library.assets.should.be.an('array');
            library.assets.forEach(version => {

                version.version.should.be.a('string');
                version.isUnstable.should.be.a('boolean');
                version.files.should.be.an('array');
                version.files.forEach(file => file.should.be.a('string'));
                version.urls.should.be.an('array');
                version.urls.forEach(url => url.should.be.a('string'));
            });

        });
    });

    it('should throw an exception when no library specified', function() {
        bootcdn.fetchLibrary.bind(null, '').should.throw(TypeError);
    });

});

