import postcss from "postcss";
import test  from "ava";
import fs    from "fs";
import plugin from "../";

function run(t, inputPath, outputPath, opts = { }) {
  opts.from = inputPath;
  const input = fs.readFileSync(inputPath, "utf8");
  const output = fs.readFileSync(outputPath, "utf8");
  return postcss([ plugin(opts) ])
    .process(input)
    .then( result => {
      fs.writeFileSync(outputPath + ".log", result.css);
      t.deepEqual(result.css, output);
      t.deepEqual(result.warnings().length, 0);
    });
}

test("does something", t => {

  return run(t,
    "fixtures/base.css",
    "expected/base.css"
  );
});
