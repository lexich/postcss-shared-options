# PostCSS Shared Options [![Build Status][ci-img]][ci]

[PostCSS] plugin Share variables between different css files with scope.

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/lexich/postcss-shared-options.svg
[ci]:      https://travis-ci.org/lexich/postcss-shared-options

```css
.foo {
    /* Input example */
}
```

```css
.foo {
  /* Output example */
}
```

## Usage

```js
postcss([ require('postcss-shared-options') ])
```

See [PostCSS] docs for examples for your environment.
