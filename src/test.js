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

const parse = () =>
  text("open")
    // .debug("open")
    .then(
      F.try(F.lazy(parse))
        .or(F.not(text("close")))
        .optrep()
      // If the below is uncommented then the Array is flattened
      // .map(({ value }) => value)
    )
    // .debug("content")
    .then(text("close"));

const stream = Streams.ofArray([
  "open",
  "a",
  "b",
  "open",
  "c",
  "close",
  "d",
  "close"
]);

const parsing = parse().parse(stream);
console.log("parsing", JSON.stringify(parsing));
console.log("parsing.value", JSON.stringify(parsing.value));
