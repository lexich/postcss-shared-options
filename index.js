const postcss = require("postcss");
const parser  = require("postcss-value-parser");
const _ = require("lodash");

const parseExpression = require("./lib/parseExpression");
const md5 = require("./lib/md5");
const readShared = require("./lib/readShared").readShared;

module.exports = postcss.plugin("postcss-shared-options", function (opts) {
  opts = opts || {};
  return function (css) {
    const hash = md5(css.source.input.css);
    const confs = [];
    css.walkAtRules("shared", (shared)=> {
      const expr = parseExpression(shared.params);
      expr && confs.push(expr);
      shared.remove();
    });
    return Promise.all(confs.map((conf)=> readShared(conf, opts.from || "")))
      .then(
        (args)=> {
          return _.reduce(args, (memo, item)=>  {
            const ptr = _.find(memo, (it)=> it.path === item.path);
            if (ptr) {
              ptr.groups = _.merge(ptr.groups, item.groups);
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
            const conf = c.groups;
            const hashImport = md5(c.file + hash);
            css.prepend({
              type: "rule",
              selector: ":root",
              nodes: _.reduce(conf, (memo, vars)=> {
                const buf = _.map(vars, (value, p)=> {
                  const prop = p + "-" + hashImport;
                  mapVars[p] = prop;
                  return {
                    value, prop,
                    type: "decl",
                    raws: { before: "\n  " }
                  };
                });
                return memo.concat(buf);
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
