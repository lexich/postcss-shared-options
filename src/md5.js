// @flow

import crypto from "crypto";

module.exports = function md5(val: string): string {
  const md5sum = crypto.createHash("md5");
  md5sum.update(val);
  return md5sum.digest("hex").slice(0, 6);
};
