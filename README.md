# PostCSS Shared Options [![Build Status][ci-img]][ci]

[PostCSS] plugin Share variables between different css files with scope.

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/lexich/postcss-shared-options.svg
[ci]:      https://travis-ci.org/lexich/postcss-shared-options


```css
/* vars.css */
:root {
  --root-width: 25px;
}
```

```css
@shared --root-width from "./vars.css"
.foo {
    width: var(--root-width);
    height: calc(var(--root-width) * 2);
}
```

```css
:root {
  --root-width-<md5_hash>: 25px;
}
.foo {
  width: var(--root-width-<md5_hash>);
  height: calc(var(--root-width-<md5_hash>) * 2);
}
```

## Usage

```js
postcss([ require('postcss-shared-options') ])
```

See [PostCSS] docs for examples for your environment.
