import postcss from "postcss";
import test  from "ava";
import fs    from "fs";
import plugin from "../lib";

function run(t, inputPath, outputPath, opts = { }, warnings = []) {
  opts.from = inputPath;
  const input = fs.readFileSync(inputPath, "utf8");
  const output = fs.readFileSync(outputPath, "utf8");
  return postcss([ plugin(opts) ])
    .process(input)
    .then( result => {
      fs.writeFileSync(outputPath + ".log", result.css);
      t.deepEqual(result.css, output);

      const warns = result.warnings().map((err)=> err.text);
      t.deepEqual(warns, warnings);
    });
}

test("test base.css", t => {
  return run(t,
    "fixtures/base.css",
    "expected/base.css"
  );
});

test("test base.2.css", t => {
  return run(t,
    "fixtures/base.2.css",
    "expected/base.2.css"
  );
});

test("test base.3.css", t => {
  return run(t,
    "fixtures/base.3.css",
    "expected/base.3.css"
  );
});

test("test base.multiple-func.css", t => {
  return run(t,
    "fixtures/base.multiple-func.css",
    "expected/base.multiple-func.css"
  );
});

test("test base.error.css", t => {
  return run(t,
    "fixtures/base.error.css",
    "expected/base.error.css",
    {},
    [
      "Invalid expression: @shared --color-red from \"./base.vars.css\" hello",
      "Variables doesn't exists: --color-black"
    ]
  );
});

test("test base.integrations.css", t => {
  return run(t,
    "fixtures/base.integration.css",
    "expected/base.integration.css"
  );
});

test("test base.multiline.css", t => {
  return run(t,
    "fixtures/base.multiline.css",
    "expected/base.multiline.css"
  );
});
