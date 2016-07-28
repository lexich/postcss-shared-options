///<reference path="../typings/postcss-value-parser.d.ts" />
import parser = require("postcss-value-parser");

import extractFromQuotes from "./extractFromQuotes";

export declare interface ParserNodes {
  values: Array<string>;
  path: string;
  error?: string;
}

const rx = /^(.+)[ ]+from[ ]+[\'\"]{1}(.+)[\'\"]{1}$/;

export default function parseExpression(expr: string): ParserNodes {
  const normExp = (expr || "").trim().replace(/\n/g, " ");
  if (!rx.test(normExp)) {
    return { values: [], path: "", error: `Invalid expression: @shared ${expr}` };
  }
  const params = RegExp.$1;
  const filePath = extractFromQuotes(RegExp.$2);
  const p = parser(params);

  const values = p.nodes ? p.nodes.reduce((memo, node) => {
    if (node.type === "word") {
      if (memo.indexOf(node.value) === -1) {
        memo[memo.length] = node.value;
      }
    }
    return memo;
  }, []) : [];
  return { values: values, path: filePath };
}
