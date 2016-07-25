///<reference path="../typings/node/node.d.ts"/>
import { createHash } from "crypto";

export default function(arg: string): string {
  const md5sum = createHash("md5");
  md5sum.update(arg);
  return md5sum.digest("hex").slice(0, 6);
}
