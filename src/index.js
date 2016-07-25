import postcss from "postcss";
import parser from "postcss-value-parser";
import _ from "lodash";

import parseExpression from "./parseExpression";
import md5 from "./md5";
import { readShared } from "./readShared";

type PostcssoptionsType = { from: string };

declare class PostcssClass {
  walkAtRules(node: string, f: *): void;
}

declare class PostcssnodeClass {

}


function plugin(opts: PostcssoptionsType) : * {
  opts = opts || {};
  return function (css: PostcssClass) : * {
    const hash = md5(css.source.input.css);
    const confs = [];
    css.walkAtRules("shared", (shared: PostcssnodeClass)=> {
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
          const mapVars = {};
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
}

export default postcss.plugin("postcss-shared-options", plugin);
