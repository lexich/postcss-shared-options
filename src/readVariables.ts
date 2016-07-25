///<reference path="../typings/node/node.d.ts"/>
///<reference path="../typings/promise/promise.d.ts"/>
import * as path from "path";
import { ParserNodes } from "./parseExpression";
import { Rule, Declaration, Result} from "postcss";
import * as postcss from "postcss";
import * as fs from "fs";

export declare interface Config {
  values: {
    [key: string]: string
  };
  path: string;
};

export function readAST(filePath: string): Promise.IThenable<Result> {
  return new Promise(
    (resolve, reject) => fs.readFile(filePath, "utf8",
      (err, data) => err ? reject(err) : resolve(data))
  ).then(
    (data) => new Promise(
      (resolve) => postcss([]).process(data).then(resolve)));
}


export default function readVariables(sourcePath: string, from: string): Promise.IThenable<Config> {
  const dir = path.dirname(from);
  const absPath = path.resolve(dir, sourcePath);
  return readAST(absPath).then((css) => {
    const result: { [key: string]: string } = {};
    css.root.nodes.forEach((rule: Rule) => {
      if (rule.type === "rule" && rule.selector === ":root") {
        rule.nodes.forEach((n: Declaration) => {
          if (n.type === "decl") {
            result[n.prop] = n.value;
          }
        });
      }
    });
    return { path: absPath, values: result };
  });
}
