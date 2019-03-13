const {
  Streams,
  F,
  Parser,
  parsec: { response }
} = require("@masala/parser");

const text = text =>
  new Parser((input, index = 0) => {
    // console.log("input.unsafeGet(index)", input.unsafeGet(index));
    const current = input.get(index);
    if (current && current.value && text === current.value) {
      return response.accept(current.value, input, index + 1, true);
    }
    return response.reject(input, index, false);
  });

const count = () =>
  F.try(text("a").map(() => ({ a: 1 })))
    .or(text("b").map(() => ({ b: 1 })))
    .optrep()
    .map(r =>
      r
        .array()
        .reduce(
          (acc, f) =>
            acc[Object.keys(f)[0]]
              ? { ...acc, [Object.keys(f)[0]]: acc[Object.keys(f)[0]] + 1 }
              : { ...acc, ...f },
          {}
        )
    );

const parse_raw = () =>
  text("open")
    .then(F.not(text("close")).optrep())
    .then(text("close"));

const parse_count = () =>
  text("open")
    .then(count())
    .then(text("close"));

const stream = Streams.ofArray(["open", "a", "b", "a", "close"]);

const parsing_raw = parse_raw().parse(stream);
console.log("parsing_raw.value", JSON.stringify(parsing_raw.value));
const parsing_count = parse_count().parse(stream);
console.log("parsing_count.value", JSON.stringify(parsing_count.value));

// const parse_layer = () =>
//   text("open")
//     .then(F.layer(count()).and(F.not(text("close")).optrep()))
//     .then(text("close"));
// parsing_layer.value ["open",[{"a":2,"b":1},["a","b","a"]],"close"]
