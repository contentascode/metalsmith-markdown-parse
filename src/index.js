const debug = require('debug')('metalsmith:markdown-parse');
const async = require('async');
const path = require('path');
const minimatch = require('minimatch');
const marked = require('marked');
const commonmark = require('commonmark');
// default mode
const md = require('markdown-it')();

/**
 * Expose `plugin`.
 */

module.exports = plugin;

/**
 *
 * Metalsmith plugin to parse markdown into file metadata.
 *
 * @param {Object} options
 * @param {string} options.pattern Pattern for navigation files.
 *
 * @return {Function}
 */

// ## Workflow
//
// ### Workflow Label 1
// > Context
// Question Text
//   - [Answer Title](#workflow-label-2)
//   - [Answer Title](#workflow-label-3)

function plugin(options) {
  const { pattern = '**/*.md', title = 'Workflow', replace = '' } = options || {};

  return function markdown_parse(files, metalsmith, done) {
    const tree = {};

    const process = (file, key, cb) => {
      // function transclusionLink(text) {
      //   const transclusion = /:\[.*\]\((\S*)\s?(\S?)\)/;
      //   const match = text.match(transclusion);
      //   if (!match)
      //     console.error('Warning could not recognise a transclusion link in the markdown workflow.', { text, key });
      //   return match ? match[1] : text;
      // }

      // console.log('key', key);
      if (minimatch(key, pattern)) {
        // const reader = new commonmark.Parser();
        // const parsed = reader.parse(file.contents.toString());
        //
        // const walker = parsed.walker();
        // let event, node, workflow_walker;
        // let inHeading = false;
        //
        // while ((event = walker.next())) {
        //   const { type, level, literal } = event.node;
        //   if (type === 'heading' && level === 2) {
        //     if (event.entering) {
        //       inHeading = true;
        //     } else {
        //       inHeading = false;
        //     }
        //   } else if (inHeading && type === 'text' && literal === title) {
        //     workflow_walker = walker();
        //   }
        // }
        //
        // while ((event = workflow_walker.next())) {
        //   const { type, level, literal, walker } = event.node;
        //   console.log('{ type, level, literal}', { type, level, literal });
        // }

        const tokens = marked.lexer(file.contents.toString(), options);
        const { name: current_name } = path.parse(key);
        // console.log('tokens', JSON.stringify(tokens, true, 2));
        tree[key] = tokens.reduce(
          ({ workflow, current, heading, in_workflow, in_list, in_quote }, { type, depth, text }) => {
            // console.log(
            //   '{ workflow, current, heading, in_workflow, in_list, in_quote }',
            //   JSON.stringify({ workflow, current, heading, in_workflow, in_list, in_quote }, true, 2)
            // );
            // console.log('{ type, depth, text }', JSON.stringify({ type, depth, text }, true, 2));
            const [t, c, h, iw, il, iq] =
              type === 'heading' && depth === 2 && text === title
                ? [workflow, current, '', false]
                : type === 'heading' && depth === 3
                  ? [
                      { ...workflow, [text]: { quote: '', description: '', list: [] } },
                      current,
                      text,
                      true,
                      in_list,
                      in_quote
                    ]
                  : type === 'blockquote_start'
                    ? [workflow, current, heading, in_workflow, in_list, true]
                    : type === 'list_item_start'
                      ? [workflow, current, heading, in_workflow, true, in_quote]
                      : type === 'text' && in_list
                        ? [
                            {
                              ...workflow,
                              [heading]: {
                                ...workflow[heading],
                                list: [...workflow[heading].list, text]
                              }
                            },
                            current,
                            heading,
                            in_workflow,
                            in_list,
                            in_quote
                          ]
                        : (type === 'paragraph' || type === 'space') && in_quote
                          ? [
                              {
                                ...workflow,
                                [heading]: {
                                  ...workflow[heading],
                                  quote: workflow[heading].quote + (type === 'paragraph' ? text : '\n')
                                }
                              },
                              current,
                              heading,
                              in_workflow,
                              in_list,
                              in_quote
                            ]
                          : (type === 'paragraph' || type === 'space') && in_workflow && !in_quote && !in_list
                            ? [
                                {
                                  ...workflow,
                                  [heading]: {
                                    ...workflow[heading],
                                    description: workflow[heading].description + (type === 'paragraph' ? text : '\n')
                                  }
                                },
                                current,
                                heading,
                                in_workflow,
                                in_list,
                                in_quote
                              ]
                            : type === 'list_item_end'
                              ? [workflow, current, heading, false, in_quote]
                              : type === 'blockquote_end'
                                ? [workflow, current, heading, in_workflow, in_list, false]
                                : [workflow, current, heading, in_workflow, in_list, in_quote];

            return { workflow: t, current: c, heading: h, in_workflow: iw, in_list: il, in_quote: iq };
          },
          { workflow: {}, current: '', heading: '', in_workflow: false, in_list: false, in_quote: false }
        );
        // console.log('tree[key]', JSON.stringify(tree[key], true, 2));
        function reverseString(str) {
          return str === '' ? '' : reverseString(str.substr(1)) + str.charAt(0);
        }
        file.contents = new Buffer(file.contents.toString().replace(/## Workflow((\s|\S)*?)^## /gm, replace + '## '));
        // console.log('file.contents', file.contents.toString());
        file[title.toLowerCase()] = tree[key].workflow;
        // console.log('file[' + title.toLowerCase() + ']', tree[key].workflow);
        // const parsed = md.parse(file.contents.toString());
        // console.log('parsed', JSON.stringify(parsed, true, 2));
        return cb(null, file);
      }
      cb(null, file);
    };

    async.mapValues(files, process, err => {
      if (err) throw err;

      debug('tree', JSON.stringify(tree, true, 2));

      // const dictionary = Object.keys(tree).reduce(function(acc, val) {
      //   const merge = Object.keys(tree[val].dictionary).reduce(
      //     function(a, v) {
      //       return { ...a, [v]: { ...a[v], ...tree[val].dictionary[v] } };
      //     },
      //     { ...acc }
      //   );
      //   // console.log('merge', merge)
      //   return { ...acc, ...merge };
      // }, {});
      //
      // // Map file names of the form `link.md`
      // const mapping = Object.keys(dictionary).reduce((acc, val) => ({ ...acc, [val + '.md']: dictionary[val] }), {});
      //
      // // Map file names of the form `link/index.md`
      // const mapping_folder = Object.keys(dictionary).reduce(
      //   (acc, val) => ({ ...acc, [val + '/index.md']: dictionary[val] }),
      //   {}
      // );

      // debug('mappings: ', Object.keys(mapping));

      // Object.keys(files).forEach(key => {
      //   const match = Object.keys(mapping).includes(key) || Object.keys(mapping_folder).includes(key);
      //   if (match) {
      //     files[key] = { ...files[key], ...mapping[key] };
      //   }
      // });
      done();
    });
  };
}
