# Code

This document describes how the code is structured. For what the code does, consult the list of highlights in the [root directory](../). The [`./server`](./server) and [`./client/core`](./client/core) directories, in that order, should help understand how the website works.

## TypeScript

Every source file in this repository uses [TypeScript](https://www.typescriptlang.org/), albeit a limited subset - the so-called [erasable syntax](https://www.typescriptlang.org/tsconfig/#erasableSyntaxOnly) (corresponding to node's now-default `--experimental-strip-types` flag). This allows us to use the full power of TypeScript's type checking while relying fully on JavaScript's runtime behavior.

As of July 2025, all modern versions of Node support that subset natively, so there is no need to run that separately.

On the browser-side, even though the [TC39 proposal](https://github.com/tc39/proposal-type-annotations) seems stagnant, I hope that browsers will support type annotations so that even removing the types is not necessary.

Last but not least, some important notes on bundling and, more generally, on the build process, can be found [here](./build/#typescript).

## ESlint

We use [ESLint](https://eslint.org/) with some plugins for both plain JavaScript and TypeScript. The first configuration is committed on 2015-11-23, making it the second-oldest dependency still in use [after SASS](../client/styles).

## Testing

Testing is discussed in [`./testing`](./testing).
