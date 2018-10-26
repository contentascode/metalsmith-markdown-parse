const debug = require("debug")("metalsmith:markdown-parse");
const async = require("async");
const path = require("path");
const minimatch = require("minimatch");
const marked = require("marked");
const pug = require("pug");
const { Streams } = require("@masala/parser");

const parse = require("./parse");

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
    pattern = "**/*.md",
    title = "Workflow",
    replace = "",
    layout = "question.pug"
  } =
    options || {};

  return function markdown_parse(files, metalsmith, done) {
    const tree = {},
      raw = {},
      processed = {};

    const process = (file, key, cb) => {
      // console.log('key', key);
      if (minimatch(key, pattern)) {
        const tokens = marked.lexer(file.contents.toString(), options);

        // console.log("tokens", tokens);

        const stream = Streams.ofArray(tokens);

        // const stream = Streams.ofArray([
        //   { type: "heading", text: "test" },
        //   { type: "blah", text: "a" }
        // ]);

        const parsing = parse.workflow().parse(stream);
        // console.log("parsing.value", JSON.stringify(parsing.value, true, 2));
        const parsing_raw = parse.workflow_raw().parse(stream);
        // console.log(
        //   "parsing_raw.value",
        //   JSON.stringify(parsing_raw.value, true, 2)
        // );

        raw[key] = parsing_raw.value
          ? parsing_raw.value
              .array()
              .map(question =>
                question.reduce(
                  ({ ...fields }, field) => ({ ...fields, ...field }),
                  {}
                )
              )
          : [];

        processed[key] = parsing.value
          ? parsing.value.array().map(question =>
              question.reduce(
                ({ ...fields }, field) => ({
                  ...fields,
                  ...(field.quote
                    ? {
                        quote: marked.parser(
                          Object.defineProperty(field.quote, "links", {
                            value: {}
                          })
                        )
                      }
                    : field.list
                      ? {
                          list: marked
                            .parser(
                              // field.list
                              Object.defineProperty(field.list, "links", {
                                value: {}
                              })
                            )
                            .replace(/<a href="#/g, '<a href="../')
                        }
                      : field)
                }),
                {}
              )
            )
          : [];

        const unindent = token =>
          token.type === "heading" && token.depth > 2
            ? { ...token, depth: token.depth - 2 }
            : token;

        tree[key] = processed[key].map((v, i) => {
          // console.log(raw[key][i]);
          return {
            ...v,
            html: marked
              .parser(
                Object.defineProperty(
                  raw[key][i].value.map(unindent),
                  "links",
                  {
                    value: {}
                  }
                )
              )
              .replace(/<a href="#/g, '<a href="../')
          };
        });

        // console.log("tree[key]", JSON.stringify(tree[key], true, 2));

        tree[key].forEach(
          ({ id: index, description, quote, list, html: raw = "" }) => {
            // console.log('index', index);
            // console.log("question id", index);
            const newKey =
              key.replace(".md", "") + "/questions/" + index + ".md";

            // Detect filtered collection transclusion link such as
            //  :[](organisations?tags=ddos,defaced&lang=en,es)

            const selector = /:<a href="(.*)"><\/a>/.exec(raw);
            const [collection_name, filter = ""] = selector
              ? selector[1].split("?")
              : [];
            const metadata = metalsmith.metadata();
            const collection = selector ? metadata[collection_name] : [];
            // console.log('filter', filter);
            const processed = raw.replace(
              /:<a href="(.*)"><\/a>/gm,
              collection
                .filter(item => {
                  // console.log('item', item);
                  return filter.split("&").some(f => {
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
                    return f.split("=")[0] != ""
                      ? item[f.split("=")[0]]
                          .split(",")
                          .map(s => s.trim())
                          .includes(f.split("=")[1])
                      : true;
                  });
                })
                .map(item =>
                  pug.renderFile(
                    path.join(
                      metalsmith.dir || metalsmith._directory,
                      metalsmith._src || metalsmith._source,
                      "../code/templates",
                      "organisation.pug"
                    ),
                    item
                  )
                )
                .join("<br>")
            );
            // console.log('processed', processed);
            const newFile = {
              layout,
              description,
              quote,
              list,
              raw: processed,
              origin: key,
              ...(file.permalink
                ? { permalink: path.join(file.permalink, index) }
                : null),
              contents: new Buffer(processed)
            };
            files[newKey] = newFile;
          }
        );

        // If tree[key] has content then we parsed a workflow and replace the section
        file.contents = tree[key][0]
          ? new Buffer(
              file.contents
                .toString()
                .replace(
                  /## Workflow((\s|\S)*?)^## /gm,
                  replace.replace("$start", "questions/" + tree[key][0].id) +
                    "\n## "
                )
            )
          : file.contents;

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

      debug("tree", JSON.stringify(tree, true, 2));

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
