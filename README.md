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
> Returns a Promise to fetch libraries from bootcdn.cn .

### fetchLibrary(library)
> Return library information from the specified library name.

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

bootcdn.fetchLibrary('bootstrap')
    .then(bootstrap => console.log(bootstrap));
/* Set {
      { versionName: '4.0.0-alpha.3',
        isUnstable: true,
        urls:
           [ '//cdn.bootcss.com/bootstrap/4.0.0-alpha.3/css/bootstrap.css',
             '//cdn.bootcss.com/bootstrap/4.0.0-alpha.3/css/bootstrap.min.css',
             '//cdn.bootcss.com/bootstrap/4.0.0-alpha.3/js/bootstrap.js',
             '//cdn.bootcss.com/bootstrap/4.0.0-alpha.3/js/bootstrap.min.js' ] },
      { versionName: '4.0.0-alpha.2',
        isUnstable: true,
        urls:
           [ '//cdn.bootcss.com/bootstrap/4.0.0-alpha.2/css/bootstrap.css',
             '//cdn.bootcss.com/bootstrap/4.0.0-alpha.2/css/bootstrap.min.css',
             '//cdn.bootcss.com/bootstrap/4.0.0-alpha.2/js/bootstrap.js',
             '//cdn.bootcss.com/bootstrap/4.0.0-alpha.2/js/bootstrap.min.js',
             ...] },
      ... }
*/
```


## License
Using MIT.

Issues and pull requests are welcome.

