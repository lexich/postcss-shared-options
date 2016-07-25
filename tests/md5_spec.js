// @flow
import test  from "ava";
import md5 from "../lib/md5";

test("test md5", t => {
  t.is(
    md5("hello"),
    "5d4140",
    "test for 'hello' string"
  );
});
