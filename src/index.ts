///<reference path="../typings/lodash/lodash.d.ts" />
///<reference path="../node_modules/postcss/d.ts/input.d.ts" />

import * as _ from "lodash";

import { plugin, Container, Result, Declaration } from "postcss";

import * as postcss from "postcss";
import md5 from "./md5";

import processDecl from "./processDecl";
import parseExpression, { ParserNodes } from "./parseExpression";
import readVariables from "./readVariables";
import * as path from "path";



declare interface Option {
  from: string;
}

export default plugin("postcss-shared-options", function(opts: Option) {
  return function(css: Container, result: Result) {
    const hash = md5(css.source.input.css);
    const confs: Array<ParserNodes> = [];
    css.walkAtRules("shared", (shared) => {
      const expr = parseExpression(shared.params);
      if (expr.error) {
        shared.warn(result, expr.error, { plugin: "postcss-shared-options" });
      } else {
        confs.push(expr);
        shared.remove();
      }
    });
    const optsFrom = opts.from || "";
    const read = _.memoize(readVariables);
    return Promise.all(confs.map(
      (conf) => read(conf.path, optsFrom)
        .then((vars) => {
          const buf: { [key: string]: string } = {};
          const varsKeys = Object.keys(vars.values);

          // test that export variable exists
          const errors = conf.values.reduce((memo, key)=> {
            if (varsKeys.indexOf(key) === -1) {
              memo[memo.length] = key;
            }
            return memo;
          }, []);

          const values = _.reduce(vars.values, (memo, val, key) => {
            if (conf.values.indexOf(key) > -1) {
              memo[key] = val;
            }
            return memo;
          }, buf);
          return { path: vars.path, values, errors };
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
            const relPath = path.relative(optsFrom, c.path);
            const hashImport = md5(relPath + hash);

            let rootRule: postcss.Rule = null;
            const getRootRule = (): postcss.Rule => {
              css.walkRules(":root", (root) => {
                !rootRule && (rootRule = root);
              });
              if (!rootRule) {
                rootRule = postcss.rule({
                  selector: ":root"
                });
                css.prepend(rootRule);
              }
              return rootRule;
            }
            _.each(c.values, (value, p) => {
              const prop = p + "-" + hashImport;
              mapVars[p] = prop;
              const decl = postcss.decl({
                value, prop,
                raws: { before: "\n  " }
              });
              getRootRule().append(decl);
            });
          });
          const allErrors = imports.reduce((memo, item) => {
            return memo.concat(item.errors);
          }, []);
          if (allErrors.length && css.nodes[0]) {
            const messages = allErrors.join(" ");
            css.nodes[0].warn(
              result,
              `Variables doesn't exists: ${messages}`,
              { plugin: "postcss-shared-options" }
            );
          }
          css.walkDecls((decl) => {
            decl.value = processDecl(decl.value, mapVars);
          });
        });
  };
});




