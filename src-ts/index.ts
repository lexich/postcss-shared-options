///<reference path="../typings/lodash/lodash.d.ts" />
import * as _ from "lodash";

import { plugin, Container, Result, Input } from "postcss";


import * as postcss from "postcss";
import md5 from "./md5";
import parser = require("postcss-value-parser");
import parseExpression, { ParserNodes } from "./parseExpression";
import readShared from "./readShared";


declare interface Option {
  from: string
}

declare interface FakeInput extends Input {
  css: string
}

export default plugin("postcss-shared-options", function(opts: Option) {
  return function(css: Container) {
    const hash = md5(css.source.input.css);
    const confs: Array<ParserNodes> = [];
    css.walkAtRules("shared", (shared)=> {
      const expr = parseExpression(shared.params);
      expr && confs.push(expr);
      shared.remove();
    });
    return Promise.all(confs.map(
      (conf)=> readShared(conf, opts.from || "")
    ))
      .then(
        (args)=> {
          return _.reduce(args, (memo, item)=>  {
            const ptr = _.find(memo, (it)=> it.path === item.path);
            if (ptr) {
              ptr.values = _.merge(ptr.values, item.values);
            } else {
              memo = memo.concat(item);
            }
            return memo;
          }, []);
        })
      .then(
        (imports)=> {
          const mapVars: { [key: string]: string } = {};
          imports.forEach((c)=> {
            const hashImport = md5(c.file + hash);
            css.prepend({
              type: "rule",
              selector: ":root",
              nodes: _.reduce(c.values, (memo, value, p)=> {
                const prop = p + "-" + hashImport;
                mapVars[p] = prop;
                memo[memo.length] = {
                  value, prop,
                  type: "decl",
                  raws: { before: "\n  " }
                };
                return memo;
              }, [])
            });
          });

          css.walkDecls((decl)=> {
            if (/var/.test(decl.value)) {
              const p = parser(decl.value);
              p.nodes.forEach((node)=> {
                if (node.type === "function" && node.value === "var") {
                  node.nodes.forEach((n)=> {
                    if (n.type === "word") {
                      n.value = mapVars[n.value] || n.value;
                    }
                  });
                }
              });
              decl.value = p.toString();
            }
          });
        });
  };
});




