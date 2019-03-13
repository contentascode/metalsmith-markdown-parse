const { Streams, C, F } = require("@masala/parser");

const remainingCells = () =>
  F.try(
    C.char(",")
      .drop()
      .then(cells())
  ).or(F.returns([]));

const cellContent = () =>
  F.not(C.charIn(",\n"))
    .optrep()
    .map(r => r.array().join(""));

const cells = () =>
  cellContent()
    .then(F.lazy(remainingCells).opt())
    .map(([first, next]) => [first].concat(next.orElse([])));

const eol = () => C.char("\n");

const line = () =>
  cells()
    .thenLeft(eol())
    // Not sure why I have to wrap each line in an Array
    // Maybe because I unwrapped the List in cells?
    .map(r => [r]);

const csvFile = () =>
  line()
    .rep()
    .thenLeft(F.eos())
    .map(a => a.array());

const stream = Streams.ofString("test,no\na,b\nlook_ma_only_one_cell\n");

const parsing = csvFile().parse(stream);
console.log("parsing", JSON.stringify(parsing));
console.log("parsing.value", JSON.stringify(parsing.value));
