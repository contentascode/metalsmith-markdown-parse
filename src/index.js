const debug = require('debug')('metalsmith:markdown-parse')
const async = require('async')
const path = require('path')
const minimatch = require('minimatch')
const marked = require('marked')
const pug = require('pug')
const { Streams } = require('@masala/parser')

const parse = require('./parse')
const { PerformanceObserver, performance } = require('perf_hooks')

const obs = new PerformanceObserver(items => {
  debug(items.getEntries()[0].name, items.getEntries()[0].duration)
})
obs.observe({ entryTypes: ['measure'] })

/**
 * Expose `plugin`.
 */

module.exports = plugin

/**
 *
 * Metalsmith plugin to parse markdown into file metadata.
 *
 * @param {Object} options
 * @param {string} options.pattern Pattern for navigation files.
 * @param {string} options.title Heading level 2 title to match for workflow (default: "Workflow").
 * @param {string} options.replace The whole workflow section will be replaced by this link,
 *                                 using the $start variable to link to the first question.
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
  const {
    pattern = '**/*.md',
    title = 'Workflow',
    replace = '',
    layout = 'question.pug',
  } = options || {}

  const parse_workflow = parse.workflow()
  const parse_workflow_raw = parse.workflow_raw()

  return function markdown_parse(files, metalsmith, done) {
    const tree = {},
      raw = {},
      processed = {}
    const process = (file, key, cb) => {
      performance.mark('A')
      // console.log('key', key);
      if (minimatch(key, pattern)) {
        const tokens = marked.lexer(file.contents.toString(), options)

        // console.log('tokens', tokens)

        const stream = Streams.ofArray(tokens)

        // const stream = Streams.ofArray([
        //   { type: "heading", text: "test" },
        //   { type: "blah", text: "a" }
        // ]);

        const parsing = parse_workflow.parse(stream)
        // console.log('parsing.value', JSON.stringify(parsing.value, true, 2))
        // the workflow_raw parser only splits by questions but parses what's between as raw content.
        const parsing_raw = parse_workflow_raw.parse(stream)
        // console.log(
        //   'parsing_raw.value',
        //   JSON.stringify(parsing_raw.value, true, 2)
        // )

        raw[key] = parsing_raw.value
          ? parsing_raw.value
              .array()
              .map(question =>
                question.reduce(
                  ({ ...fields }, field) => ({ ...fields, ...field }),
                  {}
                )
              )
          : []

        // console.log('raw[' + key + ']', raw[key])

        const process_list = list =>
          list.map(item => {
            if (item.list) {
              return {
                type: 'html',
                text: marked.parser(
                  Object.defineProperty(process_list(item.list), 'links', {
                    value: {},
                  })
                ),
              }
            } else {
              return item
            }
          })

        performance.mark('B')
        performance.measure('A to B: ' + key, 'A', 'B')

        try {
          processed[key] = parsing.value
            ? parsing.value.array().map(question => {
                // Render markdown inside parsed fields
                return question
                  ? question.reduce(({ ...fields }, field) => {
                      // if (field.list) {
                      //   console.log(
                      //     'field.list',
                      //     JSON.stringify(field.list, 2, true)
                      //   )
                      //   // field.list = field.list.filter(item => !item.list)
                      //   console.log(
                      //     'process_list(field.list)',
                      //     JSON.stringify(process_list(field.list), 2, true)
                      //   )
                      //   console.log(
                      //     'parser#',
                      //     marked
                      //       .parser(
                      //         // field.list
                      //         Object.defineProperty(
                      //           process_list(field.list),
                      //           'links',
                      //           {
                      //             value: {},
                      //           }
                      //         )
                      //       )
                      //       .replace(/<a href="#/g, '<a href="../')
                      //   )
                      // }
                      return {
                        ...fields,
                        ...(field.quote
                          ? {
                              quote: marked.parser(
                                // field.quote
                                Object.defineProperty(field.quote, 'links', {
                                  value: {},
                                })
                              ),
                            }
                          : field.list
                          ? {
                              list: marked
                                .parser(
                                  Object.defineProperty(
                                    process_list(field.list),
                                    'links',
                                    {
                                      value: {},
                                    }
                                  )
                                )
                                .replace(/<a href="#/g, '<a href="../'),
                            }
                          : field.intro
                          ? { description: marked(field.intro).trim() }
                          : field.description
                          ? { description: marked(field.description).trim() }
                          : field.outro
                          ? { description: marked(field.outro).trim() }
                          : field),
                      }
                    }, {})
                  : question
              })
            : []
        } catch (e) {
          console.error(e)
          console.log('parsing.value.array()', parsing.value.array())
          throw e
        }

        // console.log('processed[' + key + ']', processed[key])

        const unindent = token =>
          token.type === 'heading' && token.depth > 2
            ? { ...token, depth: token.depth - 2 }
            : token

        // Add raw key with inter-heading blocks from workflow_raw
        tree[key] = processed[key].map((v, i) => {
          return {
            ...v,
            raw: marked
              .parser(
                Object.defineProperty(
                  raw[key][i].value.map(unindent),
                  'links',
                  {
                    value: {},
                  }
                )
              )
              // transform local anchor links into link to individual question pages
              .replace(/<a href="#/g, '<a href="../'),
          }
        })

        // console.log('tree[' + key + ']', JSON.stringify(tree[key], true, 2))
        performance.mark('C')
        performance.measure('B to C: ' + key, 'B', 'C')

        tree[key].forEach(
          ({ id: index, intro, description, quote, list, outro, raw = '' }) => {
            // console.log('index', index)
            // console.log('question id', index)
            const newKey =
              key.replace('.md', '') + '/questions/' + index + '.md'

            // Detect filtered collection transclusion link such as
            //  :[](organisations?tags=ddos,defaced&lang=en,es)

            const selector = /:<a href="(.*)"><\/a>/.exec(raw)
            const [collection_name, filter = ''] = selector
              ? selector[1].split('?')
              : []
            const metadata = metalsmith.metadata()
            const collection = selector ? metadata[collection_name] : []
            // console.log('filter', filter)
            // console.log('raw', raw)
            const processed = raw.replace(
              /<p>:<a href="(.*)"><\/a><\/p>/gm,
              collection
                .filter(({ language: orglang }) => orglang === file.language)
                .filter(item => {
                  // console.log('item', item)
                  return filter.split('&amp;').some(f => {
                    // console.log('key', f.split('=')[0])
                    // console.log('value', f.split('=')[1])
                    // console.log('item[key]', item[f.split('=')[0]])
                    // console.log(
                    //   'true?',
                    //   item[f.split('=')[0]]
                    //     .split(',')
                    //     .map(s => s.trim())
                    //     .includes(f.split('=')[1])
                    // )
                    //
                    try {
                      const ret =
                        f.split('=')[0] != ''
                          ? item[f.split('=')[0]]
                              .split(',')
                              .map(s => s.trim())
                              .includes(f.split('=')[1])
                          : true
                      return ret
                    } catch (e) {
                      console.log(
                        `Error while reading transclusion link in ${key}. Syntax should be \`:[](organisations?services=foo&services=bar)\` and found \`${filter.replace(
                          '&amp;',
                          '&'
                        )}\` instead.`
                      )
                    }
                  })
                })
                .sort((a, b) => {
                  const nameA = a.name.toUpperCase() // ignore upper and lowercase
                  const nameB = b.name.toUpperCase() // ignore upper and lowercase
                  if (nameA < nameB) {
                    return -1
                  }
                  if (nameA > nameB) {
                    return 1
                  }
                  return 0
                })
                .map((item, index) =>
                  pug.renderFile(
                    path.join(
                      metalsmith.dir || metalsmith._directory,
                      metalsmith._src || metalsmith._source,
                      '../code/templates',
                      'organisation.pug'
                    ),
                    {
                      ...item,
                      index,
                      ...metadata,
                      ...(file.language ? { language: file.language } : null),
                      ...(file.author ? { author: file.author } : null),
                      ...(file.date ? { date: file.date } : null),
                    }
                  )
                )
                .join('\n')
            )
            // console.log('processed', processed);
            const newFile = {
              layout,
              intro,
              description,
              quote,
              list,
              outro,
              raw: processed,
              origin: key,
              ...(file.permalink
                ? { permalink: path.join(file.permalink, index) }
                : null),
              contents: Buffer.from(
                processed // remove newline only paragraphs
                  .replace('<p>\n</p>', '')
              ),
            }

            files[newKey] = newFile
          }
        )
        performance.mark('D')
        performance.measure('C to D: ' + key, 'C', 'D')

        // If tree[key] has content then we parsed a workflow and replace the section
        // console.log('file.contents', file.contents.toString())
        file.contents = tree[key][0]
          ? Buffer.from(
              // add end of file newline to match until Workflow end.
              (file.contents.toString() + '\n').replace(
                /## Workflow((\s|\S)*?)(.*\n)*/gm,
                replace.replace('$start', 'questions/' + tree[key][0].id) + '\n'
              )
            )
          : file.contents

        // console.log('file.contents', file.contents.toString());
        file[title.toLowerCase()] = tree[key].workflow
        // console.log('file[' + title.toLowerCase() + ']', tree[key].workflow);
        // const parsed = md.parse(file.contents.toString());
        // console.log('parsed', JSON.stringify(parsed, true, 2));

        // return cb(null, file)
        performance.mark('E')
        performance.measure('D to E: ' + key, 'D', 'E')
        performance.measure('== A to E: ' + key, 'A', 'E')
        performance.clearMarks()

        return setImmediate(cb, null, file)
      }
      performance.mark('E')
      performance.measure('<> A to E: ' + key, 'A', 'E')
      performance.clearMarks()
      setImmediate(cb, null, file)
      // cb(null, file)
    }

    async.mapValuesSeries(files, process, err => {
      if (err) throw err
      debug('Object.keys(files)', JSON.stringify(Object.keys(files), true, 2))

      // Add #final_tips section in _end questions.
      Object.keys(files)
        .filter(k => k.endsWith('_end.md'))
        .forEach(k => {
          const tips =
            k
              .split('/')
              .slice(0, -1)
              .join('/') + '/final_tips.md'

          if (files[tips]) {
            const arr_tips = files[tips].contents
              .toString()
              .replace(
                /<h2 id="resources">Resources<\/h2>/gi,
                '<-----resource----->'
              )
              .split('<-----resource----->')
            files[k].tips = arr_tips[0]
            files[k].resources = arr_tips[1]
          }
          // delete files[tips]
        })

      setImmediate(done)
    })
  }
}
