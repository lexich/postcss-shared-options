const parser  = require("postcss-value-parser");
const extractFromQuotes = require("./extractFromQuotes");

module.exports = function parseExpression(expr) {
  if (!expr) {
    return null;
  }
  const pieces = expr.split("from");
  if (pieces.length !== 2) {
    return null;
  }
  const params = pieces[0].trim();
  const filePath = extractFromQuotes(pieces[1].trim());

  const p = parser(params);
  const values = p.nodes ? p.nodes.reduce((memo, node)=> {
    if (node.type === "function") {
      const name = node.value;
      !memo[name] && (memo[name] = []);
      node.nodes.forEach((valNode)=> {
        if (valNode.type === "word") {
          if (memo[name].indexOf(valNode.value) === -1) {
            memo[name].push(valNode.value);
          }
        }
      });
    }
    return memo;
  }, {}) : {};
  return { values: values, path: filePath };
};
