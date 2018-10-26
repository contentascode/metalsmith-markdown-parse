const {
  Parser,
  F: { not, lazy, try: Ftry },
  parsec: { response }
} = require("@masala/parser");

// const anyTokens = () =>
//   new Parser((input, index = 0) => {
//     // console.log("index", index);
//     const current = input.get(index);
//     return response.accept(current.value, input, index + 1, true);
//   });

const pattern = obj =>
  new Parser((input, index = 0) => {
    // console.log("input.unsafeGet(index)", input.unsafeGet(index));
    const current = input.get(index);
    if (
      current &&
      current.value &&
      Object.keys(obj).every(k1 =>
        Object.keys(current.value).some(k2 => obj[k1] === current.value[k2])
      )
    ) {
      return response.accept(current.value, input, index + 1, true);
    }
    return response.reject(input, index, false);
  });

const space = () => pattern({ type: "space" });

const spaces = () =>
  space()
    .optrep()
    .drop();

const paragraph = () =>
  pattern({ type: "paragraph" })
    // .debug("paragraph")
    .map(({ text }) => ({ description: text }));

const blockquote = () =>
  pattern({ type: "blockquote_start" })
    .drop()
    .then(
      not(pattern({ type: "blockquote_end" }))
        .rep()
        .map(({ value }) => value)
    )
    .then(pattern({ type: "blockquote_end" }).drop())
    .map(
      tokens =>
        Array.isArray(tokens) ? { quote: tokens } : { quote: [tokens] }
    );

const list = () =>
  pattern({ type: "list_start" })
    .then(
      Ftry(lazy(list))
        .or(not(pattern({ type: "list_end" })))
        .rep()
        .map(({ value }) => value)
    )
    .then(pattern({ type: "list_end" }))
    .map(tokens => ({ list: tokens }));

const content = () =>
  spaces()
    .then(
      blockquote()
        .optrep()
        .map(({ value }) => value)
    )
    // .debug("blockquote")
    .then(spaces())
    .then(
      paragraph()
        .optrep()
        .map(({ value }) => value)
    )
    // .debug("paragraph")
    .then(spaces())
    .then(
      list()
        .optrep()
        .map(({ value }) => value)
    )
    // .debug("list")
    .then(spaces());

const heading = () =>
  pattern({ type: "heading", depth: 2, text: "Workflow" }).drop();

const question = () =>
  pattern({ type: "heading", depth: 3 })
    .map(({ text }) => ({ id: text }))
    .then(content())
    .map(r => [r]);

const workflow = () =>
  not(heading())
    .optrep()
    .drop()
    .then(heading())
    .then(question().rep());

// It might be possible to do this in only one pass
const question_raw = () =>
  pattern({ type: "heading", depth: 3 })
    .map(({ text }) => ({ id: text }))
    .then(
      not(
        pattern({ type: "heading" }).filter(heading => heading.depth <= 3)
      ).rep()
    )
    .map(r => [r]);

const workflow_raw = () =>
  not(heading())
    .optrep()
    .drop()
    .then(heading())
    .then(question_raw().rep());

export { workflow, workflow_raw };
