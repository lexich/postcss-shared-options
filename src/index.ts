///<reference path="../typings/lodash/lodash.d.ts" />
///<reference path="../node_modules/postcss/d.ts/input.d.ts" />

import * as _ from "lodash";

import { plugin, Container, Result, Declaration } from "postcss";

import * as postcss from "postcss";
import md5 from "./md5";

import processDecl from "./processDecl";
import parseExpression, { ParserNodes } from "./parseExpression";
import readVariables from "./readVariables";


declare interface Option {
  from: string;
}



export default plugin("postcss-shared-options", function(opts: Option) {
  return function(css: Container) {
    const hash = "123456"; // Fix md5(css.source.input.css);
    const confs: Array<ParserNodes> = [];
    css.walkAtRules("shared", (shared) => {
      const expr = parseExpression(shared.params);
      expr && confs.push(expr);
      shared.remove();
    });
    return Promise.all(confs.map(
      (conf) => readVariables(conf.path, opts.from || "")
        .then((vars)=> {
          const buf: { [key: string]: string } = {};
          const values = _.reduce(vars.values, (memo, val, key) => {
            if (conf.values.indexOf(key) > -1) {
              memo[key] = val;
            }
            return memo;
          }, buf);
          return { path: vars.path, values };
        })
    ))
      .then(
        (args) => {
          return _.reduce(args, (memo, item) =>  {
            const ptr = _.find(memo, (it) => it.path === item.path);
            if (ptr) {
              ptr.values = _.merge(ptr.values, item.values);
            } else {
              memo = memo.concat(item);
            }
            return memo;
          }, []);
        })
      .then(
        (imports) => {
          const mapVars: { [key: string]: string } = {};
          imports.forEach((c) => {
            const hashImport = md5(c.file + hash);

            let rootRule: postcss.Rule = null;
            css.walkRules(":root", (root) => {
              !rootRule && (rootRule = root);
            });
            if (!rootRule) {
              rootRule = postcss.rule({
                selector: ":root"
              });
              css.prepend(rootRule);
            }

            _.each(c.values, (value, p) => {
              const prop = p + "-" + hashImport;
              mapVars[p] = prop;
              const decl = postcss.decl({
                value, prop,
                raws: { before: "\n  " }
              });
              rootRule.append(decl);
            });
          });
          css.walkDecls((decl) => {
            decl.value = processDecl(decl.value, mapVars)
          });
        });
  };
});




