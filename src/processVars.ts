import parser = require("postcss-value-parser");

declare interface ObjectMap {
  [key: string]: string;
}

export function processFunction(nodes: Array<PostcssValueParser.Node>, mapVars: ObjectMap): void {
  nodes.forEach((node) => {
    if (node.type === "word") {
      node.value = mapVars[node.value] || node.value;
    } else if (node.type === "function") {
      processFunction(node.nodes, mapVars);
    }
  });
}

export default function(value: string, mapVars: ObjectMap): string {
  const p = parser(value);
  processFunction(p.nodes, mapVars);
  return p.toString();
}
