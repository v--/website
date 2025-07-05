# Styles

We use [SASS](https://sass-lang.com/) since at least the [first commit](https://github.com/v--/website/tree/46e9d45caef6c7f6606fa048871a0601509b5f6a) on 2015-08-15, and possibly a year before that. It is the oldest of our dependencies (older than even node) that is still in use. Since then both CSS and SASS itself have evolved.

I have set up [StyleLint](https://stylelint.io/) (configured in [`../../package.json`](`../../package.json`)) with several plugins to provide some aid.

It should be noted that I am not a designer, and CSS is notoriously hard to get right for different browsers. Thus, unlike for the code, here I feel on shaky ground.

Some important notes on bundling and, more generally, on the build process, can be found [here](./build/#styles).

## Pure CSS

I have seriously considered removing the dependency on SASS since the introduction of ~~variables~~ [custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascading_variables/Using_CSS_custom_properties) and [nested selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Nesting_selector) in CSS.

Here is a list of reasons why we continue using SASS:

* Custom properties cannot update when their dependents are updated (see [here](https://stackoverflow.com/questions/57666786/how-can-i-make-a-css-variable-that-is-defined-using-another-variable-reflect-cha)). We thus rely on SASS mixins for setting interdependent custom properties in bulk (see e.g. `button-background-colors` in [`./_mixins.scss`](./_mixins.scss)).

* Media queries don't allow custom properties (see [here](https://stackoverflow.com/questions/40722882/css-native-variables-not-working-in-media-queries)). We thus rely on SASS variables.

* Defining groups of variables is not possible, while we occasionally rely on the following pattern (the example is taken from [`./core/plain/body.scss`](./core/plain/body.scss)):
  ```
  body {
    ...

    @media (prefers-color-scheme: light) {
      &:not(.dark-scheme) {
        @include colors.light-scheme;
      }
    }

    @media (prefers-color-scheme: dark) {
      &:not(.light-scheme) {
        @include colors.dark-scheme;
      }
    }

    &.light-scheme {
      @include colors.light-scheme;
    }

    &.dark-scheme {
      @include colors.dark-scheme;
    }
  }
  ```

  This allows us to correctly set the scheme based on browser's preferences, but also to override is manually by clicking a button.

* Even though nested selectors are supported, we prefer to avoid deep selectors and rely on prefixing. For example, we prefer
  ```
    .sidebar {
      ...

      &-entry {
        ...
      }
    }
  ```
  to the more verbose
  ```
    .sidebar {
      ...
    }

    .sidebar-entry {
      ...
    }
  ```
  or the less semantically clear
  ```
    .sidebar {
      ...

      .entry {
        ...
      }
    }
  ```
