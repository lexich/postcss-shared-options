const postcss = require("postcss");
const path = require("path");
const fs = require("fs");
const parser  = require("postcss-value-parser");
const _ = require("lodash");
const crypto = require("crypto");

function error(msg) {
  console.error(msg);
  throw new Error(msg);
}

function extractFromQuotes(expr) {
  if (!expr) {
    error();
    return expr;
  }
  const quote = expr[0];
  if (!(quote === "\"" || quote !== "\'")) {
    error();
    return expr;
  }
  if (expr[expr.length - 1] !== quote) {
    error();
  }
  return expr.slice(1, expr.length - 1);
}

function parseExpression(expr) {
  if (!expr) {
    error();
  }
  const pieces = expr.split("from");
  if (pieces.length !== 2) {
    error();
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
}


const reader = {
  cache: {},
  readShared(filePath) {
    if (this.cache[filePath]) {
      return this.cache[filePath];
    }
    const conf = new Promise(
      (resolve, reject)=> fs.readFile(filePath, "utf8",
        (err, data)=> err ? reject(err) : resolve(data))
    ).then((data)=> new Promise((resolve)=> {
      postcss([]).process(data).then(resolve);
    }));
    this.cache[filePath] = conf;
    return conf;
  }
};

function readShared(conf, from) {
  const dir = path.dirname(from);
  const absPath = path.resolve(dir, conf.path);
  return reader.readShared(absPath).then((css)=> {
    const result = {};
    Object.keys(conf.values).forEach((key)=> {
      const values = conf.values[key];
      css.root.nodes.forEach((node)=> {
        if (node.type === "rule" && node.selector === `:${key}`) {
          node.nodes.forEach((n)=> {
            if (n.type === "decl" && values.indexOf(n.prop) > -1) {
              result[key] || (result[key] = {});
              result[key][n.prop] = n.value;
            }
          });
        }
      });
    });
    return { path: absPath, groups: result };
  });
}

function md5(val) {
  const md5sum = crypto.createHash("md5");
  md5sum.update(val);
  return md5sum.digest("hex").slice(0, 6);
}

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
        // Unsafe merge
        (args)=> _.reduce(args, (memo, item)=>  _.merge(memo, item), {}))
      .then(
        (c)=> {
          const conf = c.groups;
          const hashImport = md5(c.file + hash);
          const mapVars = {};

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
