# metalsmith-markdown-taxonomy

[![Version](https://img.shields.io/npm/v/metalsmith-transclude-transform.svg)](https://npmjs.com/package/metalsmith-transclude-transform) [![Build Status](https://travis-ci.org/contentascode/metalsmith-transclude-transform.svg?branch=master)](https://travis-ci.org/contentascode/metalsmith-transclude-transform)

  A metalsmith plugin to transform markdown into taxonomy structures.

## Installation

    $ npm install metalsmith-markdown-taxonomy

## CLI Usage

  Install via npm and then add the `metalsmith-markdown-taxonomy` key to your `metalsmith.json` plugins, like so:

```json
{
  "plugins": {
    "metalsmith-markdown-taxonomy": {
      "pattern": "categories/*.md",
    }
  }
}
```

A file matching the `pattern` such as `categories/colors.md` containing:
```
# Colors

## Red

  * :[](truck.md)

## Green

  * :[](apple.md)
  * :[](apple.md)
```

Will add a `color` tag for files that are in the bullet lists i.e. `{ "colors": "Red" }` will be merged in the `truck.md` file's metadata.

## License

  MIT
