# bootcdn-cli
A CLI interface for [bootcdn.cn](http://www.bootcdn.cn/)

[![Build status](https://travis-ci.org/bdbai/bootcdn-cli.svg)](https://travis-ci.org/bdbai/bootcdn-cli)

## Setup
```bash
sudo npm install -g bootcdn-cli
```

## Demo

[![asciicast](https://asciinema.org/a/ayf8gupozjtx4bwlqwugxh2bc.png)](https://asciinema.org/a/ayf8gupozjtx4bwlqwugxh2bc)


## Usage
```bash
# Use interactive CLI
bootcdn

# Get the latest stable version of jQuery
# with `async` HTML attribute appended
bootcdn --async jquery
bootcdn -a jquery

# Find a specific version of Bootstrap
bootcdn bootstrap@3

# Do not wrap urls with HTML tags
bootcdn --raw bootstrap@3
bootcdn -r bootstrap@3

# Find multiple libraries at one time
bootcdn jquery@2 bootstrap@3

# Reset cache first
bootcdn --force
bootcdn -f

# Check your clipboard!
```

## API
### fetchAllLibraries
> Returns a Promise to fetch libraries from [BootCDN API](https://api.bootcdn.cn/libraries.json).

### fetchAllLibraryNames
> Returns a Promise to fetch library names from [BootCDN API](https://api.bootcdn.cn/names.json).

### fetchLibrary(string)
> Returns a Promise to fetch library information with the specified library name.

### Example
```js
const bootcdn = require('bootcdn');

bootcdn.fetchAllLibraries()
    .then(libs => console.log(libs));
/* Map {
      'bootstrap' => {
        name: 'bootstrap',
        desc: 'The most popular front-end framework for developing responsive, mobile first projects on the web.',
        star: 99963 },
      'd3' => {
        name: 'd3',
        desc: 'A JavaScript visualization library for HTML and SVG.',
        star: 54254 },
      ... }
*/

bootcdn.fetchAllLibraryNames()
    .then(names => console.log(names));
/* [
     'twitter-bootstrap',
     'vue',
     'react',
     'react-dom',
     'd3',
     ... ]
*/

bootcdn.fetchLibrary('twitter-bootstrap')
    .then(bootstrap => console.log(bootstrap));
/* {
    name: 'twitter-bootstrap',
    npmName: 'bootstrap',
    version: '4.1.1',
    description: 'The most popular front-end framework for developing responsive, mobile first projects on the web.',
    homepage: 'http://getbootstrap.com/',
    keywords: [ 'css', 'less', 'mobile-first', 'responsive', 'front-end', 'framework', 'web', 'twitter', 'bootstrap' ],
    license: 'MIT',
    repository: { type: 'git', url: 'https://github.com/twbs/bootstrap' },
    assets: [
      {
        version: '4.1.1',
        files: [
                   'css/bootstrap-grid.css',
                   'css/bootstrap-grid.min.css', ... ],
        urls: [
                  'https://cdn.bootcss.com/twitter-bootstrap/4.1.1/css/bootstrap-grid.css',
                  'https://cdn.bootcss.com/twitter-bootstrap/4.1.1/css/bootstrap-grid.min.css', ... ],
        isUnstable: false
      },
      ... ],
    stars: 127718
}
*/
```


## License
Using MIT.

Issues and pull requests are welcome.

