///<reference path="../typings/node/node.d.ts"/>
///<reference path="../typings/promise/promise.d.ts"/>

import * as fs from "fs";
import * as postcss from "postcss";

export default function readSharedCSS(filePath: string): Promise.IThenable<postcss.Result> {
  return new Promise(
    (resolve, reject) => fs.readFile(filePath, "utf8",
      (err, data) => err ? reject(err) : resolve(data))
  ).then(
    (data) => new Promise(
      (resolve) => postcss([]).process(data).then(resolve)));
}
