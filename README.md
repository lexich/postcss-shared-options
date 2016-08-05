# PostCSS Shared Options 
[![Build Status][ci-img]][ci] [![npm version](https://badge.fury.io/js/postcss-shared-options.svg)](https://badge.fury.io/js/postcss-shared-options)

[PostCSS] plugin share variables between different css files with scope. 
This implementation may replace [values variables](https://github.com/css-modules/css-modules/blob/master/docs/values-variables.md) in css-modules and allow using native [css variables syntax](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables).

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/lexich/postcss-shared-options.svg
[ci]:      https://travis-ci.org/lexich/postcss-shared-options

### Before
```css
/* vars.css */
:root {
  --root-width: 25px;
}
```

```css
@shared --root-width from "./vars.css";
.foo {
    width: var(--root-width);
    height: calc(var(--root-width) * 2);
}
```

### After

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
