import postcss from "postcss";
import test  from "ava";
import fs    from "fs";
import plugin from "./";

function run(t, input, output, opts = { }) {
  return postcss([ plugin(opts) ])
    .process(input)
    .then( result => {
      fs.writeFileSync("test.css", result.css);
      t.deepEqual(result.css, output);
      t.deepEqual(result.warnings().length, 0);
    });
}

test("does something", t => {
  const input = fs.readFileSync("fixtures/base.css", "utf8");
  const output = fs.readFileSync("expected/base.css", "utf8");
  return run(t, input, output, { from: "fixtures/base.css" });
});
