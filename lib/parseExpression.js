// @flow

import parser from "postcss-value-parser";
import extractFromQuotes from "./extractFromQuotes";

const emptyVariables: VariablesType = { values: [], path: "" };

export default function parseExpression(expr: string) : VariablesType {
  if (!expr) {
    return emptyVariables;
  }
  const pieces = expr.split("from");
  if (pieces.length !== 2) {
    return emptyVariables;
  }
  const params = pieces[0].trim();
  const filePath = extractFromQuotes(pieces[1].trim());

  const p = parser(params);
  const values = p.nodes ? p.nodes.reduce((memo, node)=> {
    if (node.type === "word") {
      if (memo.indexOf(node.value) === -1) {
        memo[memo.length] = node.value;
      }
    }
    return memo;
  }, []) : [];
  return { values: values, path: filePath };
};
