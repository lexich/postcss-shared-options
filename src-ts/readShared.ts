///<reference path="../typings/promise/promise.d.ts"/>
import * as path from "path";
import readSharedCSS from "./readSharedCSS";
import { ParserNodes } from "./parseExpression";
import { Rule, Declaration } from "postcss";

export declare interface Config {
  values: {
    [key: string]: string
  },
  path: string
};

export default function readShared(conf: ParserNodes, from: string): Promise.IThenable<Config> {
  const dir = path.dirname(from);
  const absPath = path.resolve(dir, conf.path);
  return readSharedCSS(absPath).then((css)=> {
    const result: {[key:string]: string} = {};
    const values = conf.values;
    css.root.nodes.forEach((rule: Rule)=> {
      if (rule.type === "rule" && rule.selector === ":root") {
        rule.nodes.forEach((n: Declaration)=> {
          if (n.type === "decl" &&  values.indexOf(n.prop) > -1) {
            result[n.prop] = n.value;
          }
        });
      }
    });
    return { path: absPath, values: result };
  });
}
