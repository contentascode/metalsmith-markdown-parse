const debug = require('debug')('metalsmith:markdown-parse');
const async = require('async');
const path = require('path');
const minimatch = require('minimatch');
const marked = require('marked');
const commonmark = require('commonmark');
// default mode
const md = require('markdown-it')();
const pug = require('pug');

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
  const { pattern = '**/*.md', title = 'Workflow', replace = '', layout = 'question.pug' } = options || {};

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
        tree[key] = tokens.reduce(
          ({ workflow, current, heading, in_workflow, in_list, in_quote, start }, { type, depth, text }, tok) => {
            // console.log('tok', tok);
            // console.log('{ current, heading, start }', JSON.stringify({ current, heading, start }, true, 2));
            // console.log('{ type, depth, text }', JSON.stringify({ type, depth, text }, true, 2));
            const [t, c, h, iw, il, iq, s] =
              type === 'heading' && depth === 2 && text === title
                ? [workflow, current, '', true, in_list, in_quote, start]
                : type === 'heading' && depth === 2 && text !== title
                  ? [
                      {
                        ...workflow,
                        ...(start != 0 && heading !== ''
                          ? {
                              [heading]: {
                                ...workflow[heading],
                                raw: marked.parser(
                                  Object.defineProperty(
                                    tokens
                                      .slice(start, tok)
                                      .filter(t => !(t.type === 'heading' && t.depth === 3))
                                      .map(t => ({ ...t, depth: t.depth - 2 })),
                                    'links',
                                    { value: {} }
                                  )
                                )
                              }
                            }
                          : null)
                      },
                      current,
                      heading,
                      false,
                      in_list,
                      in_quote,
                      start
                    ]
                  : type === 'heading' && depth === 3
                    ? [
                        {
                          ...workflow,
                          [text]: { quote: '', description: '', list: [] },
                          ...(start != 0
                            ? {
                                [heading]: {
                                  ...workflow[heading],
                                  raw: marked.parser(
                                    Object.defineProperty(
                                      tokens
                                        .slice(start, tok)
                                        .filter(t => !(t.type === 'heading' && t.depth === 3))
                                        .map(t => ({ ...t, depth: t.depth - 2 })),
                                      'links',
                                      { value: {} }
                                    )
                                  )
                                }
                              }
                            : null)
                        },
                        current,
                        text,
                        in_workflow,
                        in_list,
                        in_quote,
                        tok
                      ]
                    : type === 'blockquote_start'
                      ? [workflow, current, heading, in_workflow, in_list, true, start]
                      : type === 'list_item_start'
                        ? [workflow, current, heading, in_workflow, true, in_quote, start]
                        : type === 'text' && in_list
                          ? [
                              {
                                ...workflow,
                                [heading]: {
                                  ...workflow[heading],
                                  list: [
                                    ...(workflow[heading] ? workflow[heading].list : {}),
                                    {
                                      href: text.replace(/\[(.*?)\]\((.*)\)$/gm, '$2'),
                                      title: text.replace(/\[(.*?)\]\((.*)\)$/gm, '$1')
                                    }
                                  ]
                                }
                              },
                              current,
                              heading,
                              in_workflow,
                              in_list,
                              in_quote,
                              start
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
                                in_quote,
                                start
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
                                  in_quote,
                                  start
                                ]
                              : type === 'list_item_end'
                                ? [workflow, current, heading, in_workflow, false, in_quote, start]
                                : type === 'blockquote_end'
                                  ? [workflow, current, heading, in_workflow, in_list, false, start]
                                  : [workflow, current, heading, in_workflow, in_list, in_quote, start];

            return { workflow: t, current: c, heading: h, in_workflow: iw, in_list: il, in_quote: iq, start: s };
          },
          { workflow: {}, current: '', heading: '', in_workflow: false, in_list: false, in_quote: false, start: 0 }
        );
        // console.log('tree[key]', JSON.stringify(tree[key], true, 2));
        function reverseString(str) {
          return str === '' ? '' : reverseString(str.substr(1)) + str.charAt(0);
        }

        const startSlug = Object.keys(tree[key].workflow)[0];

        Object.keys(tree[key].workflow).forEach(index => {
          // console.log('index', index);
          const { description, quote, list, raw = '' } = tree[key].workflow[index];
          // console.log('question', question);
          const newKey = key.replace('.md', '') + '/questions/' + index + '.md';
          // console.log('newKey', newKey);
          //           const contents = `
          // # ${question.description}
          // ${question.quote !== '' ? '> ' + question.quote : ''}
          // ${question.list.map(answer => '  - ' + answer.replace('](#', '](../')).join('\n')}
          // ${question.raw}
          // `;
          // console.log('contents', contents);

          // html2jade.convertHtml(raw, { bodyless: true }, function(err, jade) {
          //   const newFile = {
          //     layout,
          //     description,
          //     quote,
          //     list,
          //     raw,
          //     origin: key,
          //     ...(file.permalink ? { permalink: path.join(file.permalink, index) } : null),
          //     contents: new Buffer(jade)
          //   };
          //   files[newKey] = newFile;
          // });

          // Detect filtered collection transclusion link such as
          //  :[](organisations?tags=ddos,defaced&lang=en,es)

          const selector = /:<a href="(.*)"><\/a>/.exec(raw);
          const [collection_name, filter = ''] = selector ? selector[1].split('?') : [];
          const metadata = metalsmith.metadata();
          const collection = selector ? metadata[collection_name] : [];
          // console.log('filter', filter);
          const processed = raw.replace(
            /:<a href="(.*)"><\/a>/gm,
            collection
              .filter(item => {
                // console.log('item', item);
                // console.log('item', item);
                return filter.split('&').some(f => {
                  // console.log('key', f.split('=')[0]);
                  // console.log('value', f.split('=')[1]);
                  // console.log('item[key]', item[f.split('=')[0]]);
                  // console.log(
                  //   'true?',
                  //   item[f.split('=')[0]]
                  //     .split(',')
                  //     .map(s => s.trim())
                  //     .includes(f.split('=')[1])
                  // );
                  return f.split('=')[0] != ''
                    ? item[f.split('=')[0]]
                        .split(',')
                        .map(s => s.trim())
                        .includes(f.split('=')[1])
                    : true;
                });
              })
              .map(item =>
                pug.renderFile(
                  path.join(
                    metalsmith.dir || metalsmith._directory,
                    metalsmith._src || metalsmith._source,
                    '../code/templates',
                    'organisation.pug'
                  ),
                  item
                )
              )
              .join('<br>')
          );
          // console.log('processed', processed);
          const newFile = {
            layout,
            description,
            quote,
            list,
            raw: processed,
            origin: key,
            ...(file.permalink ? { permalink: path.join(file.permalink, index) } : null),
            contents: new Buffer(processed)
          };
          files[newKey] = newFile;
        });

        file.contents = new Buffer(
          file.contents
            .toString()
            .replace(/## Workflow((\s|\S)*?)^## /gm, replace.replace('$start', 'questions/' + startSlug) + '\n## ')
        );
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
