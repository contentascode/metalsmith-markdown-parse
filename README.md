# metalsmith-markdown-parse

[![Version](https://img.shields.io/npm/v/metalsmith-markdown-parse.svg)](https://npmjs.com/package/metalsmith-markdown-parse) [![Build Status](https://travis-ci.org/contentascode/metalsmith-markdown-parse.svg?branch=master)](https://travis-ci.org/contentascode/metalsmith-markdown-parse)

  A metalsmith plugin to parse markdown into (at some point) arbitrary structures. For now parses workflows for the [dfak](https://gitlab.com/rarenet/dfak) project.

## Installation

    $ npm install metalsmith-markdown-parse

## CLI Usage

  Install via npm and then add the `metalsmith-markdown-parse` key to your `metalsmith.json` plugins, like so:

```json
{
  "plugins": {
    "metalsmith-markdown-taxonomy": {
      "title": "Workflow",
      "replace": "<a href='$start'>Start</a>"
    }
  }
}
```

A level 2 header section matching the `title` such as:
```
## Workflow

### step_identifier

A question?

  - [Next](#next_step)
  - [End step](#final_step_end)

### next_step

> Some contextual information about this step

Another question?

  - [Back](#step_identifier)
  - [End](#final_step_end)

### final_step_end

Some final text.

#### An optional sub title

:[](organisations?services=web_protection)

## The end
```

Will be parsed into the following file structure:
```
/
├── index
│   └── questions
│       ├── final_step_end.md
│       ├── next_step.md
│       └── step_identifier.md
└── index.md
```

With the root `index.md` file starting the workflow with the `replace` pattern:
```
<a href="questions/step_identifier">Start</a>
## The end
```

and each question linked to each other with permalink transformation, and transclusion links `:[](folder?key=value)` interpreted (this will probably move to another module soon).

## License

  MIT
