// @flow
import path from "path";
import fs from "fs";
import postcss from "postcss";

export function readSharedCSS(filePath: string) : Promise<*> {
  return new Promise(
    (resolve, reject)=> fs.readFile(filePath, "utf8",
      (err, data)=> err ? reject(err) : resolve(data))
  ).then(
    (data)=> new Promise(
      (resolve)=> postcss([]).process(data).then(resolve)));
}

export function readShared(conf: VariablesType, from: string): Promise<VariablesType> {
  const dir = path.dirname(from);
  const absPath = path.resolve(dir, conf.path);
  return readSharedCSS(absPath)
    .then((css)=> {
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
      return { path: absPath, values: result };
    });
}
