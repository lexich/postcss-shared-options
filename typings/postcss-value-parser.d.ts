declare namespace PostcssValueParser {
  export interface Node {
    type: string,
    value: string,
    before?: string,
    after?: string,
    nodes?: Array<Node>
  }

  export interface Nodes {
    nodes: Array<Node>
  }

  export function parser(arg: string) : Nodes;
}

declare module "postcss-value-parser" {
  export = PostcssValueParser.parser;
}


