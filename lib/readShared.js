const path = require("path");
const fs = require("fs");
const postcss = require("postcss");

function readSharedCSS(filePath) {
  return new Promise(
    (resolve, reject)=> fs.readFile(filePath, "utf8",
      (err, data)=> err ? reject(err) : resolve(data))
  ).then(
    (data)=> new Promise(
      (resolve)=> postcss([]).process(data).then(resolve)));
}

function readShared(conf, from) {
  const dir = path.dirname(from);
  const absPath = path.resolve(dir, conf.path);
  return readSharedCSS(absPath).then((css)=> {
    const result = {};
    const values = conf.values;
    css.root.nodes.forEach((node)=> {
      if (node.type === "rule" && node.selector === ":root") {
        node.nodes.forEach((n)=> {
          if (n.type === "decl" && values.indexOf(n.prop) > -1) {
            result[n.prop] = n.value;
          }
        });
      }
    });
    return { path: absPath, groups: result };
  });
}

module.exports = { readShared: readShared, readSharedCSS: readSharedCSS };
