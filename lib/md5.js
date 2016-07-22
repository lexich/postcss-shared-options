const crypto = require("crypto");

module.exports = function md5(val) {
  const md5sum = crypto.createHash("md5");
  md5sum.update(val);
  return md5sum.digest("hex").slice(0, 6);
};
