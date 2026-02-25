# Personal website

This is the code for my personal website, https://ivasilev.net

For learning purposes, I have made it my goal to only rely on external dependencies for development (and not for the runtime), so I have implemented a lot from scratch. I hope some of it may be useful as a simple yet working reference unburdened by the feature creep of large libraries and frameworks. Some highlights are listed in the following sections. Think of the kind of code you see in "build your own X" tutorials.

The code is licensed under the [Unlicense](https://unlicense.org/), and whatever other content I have here is licensed under [CC0](https://creativecommons.org/public-domain/cc0/) (except for [Font Awesome](https://fontawesome.com/) and the [STIX fonts](https://www.stixfonts.org/) referenced as submodules and the [PT Sans](https://www.paratype.com/fonts/pt/pt-sans) font downloaded in [`./data/og_images`](./data/og_images)).

After running the website for 12 years, with occasional bursts of development, in 2025 I decided to do a large refactoring and publish the code on GitHub. On that occasion I wrote module overviews in the README files of some directories (perhaps a single "docs" directory would have been better?). For example, [`./code`](./code) and [`./styles`](./client/styles) contain an overview of some tools used, while the directories listed in the next section feature code that may be of interest elsewhere.

To run the code, a little setup is required:
```
git submodule update
nodenv install
npm install
ln --symbolic local.json config/active.json
```

After that, a development server can be launched via `npm run watcher` and, after the initial build, `npm run server`.

## Library code

What I call here "library code" is a bunch of reusable independent modules that would be external dependencies if it was not my goal to implement them myself. The following may be of interest:

* [Proposal-compliant](https://github.com/tc39/proposal-observable) observables with extensions based on [RxJS](https://rxjs.dev/) in [`./code/common/observable`](./code/common/observable).

* Reactive (re)rendering of virtual components based on the aforementioned observables in [`./code/common/rendering`](./code/common/rendering).

* TypeScript-friendly schema-based type validation in [`./code/common/validation`](./code/common/validation).

* An AST-based rich text system with Markdown, HTML and MathML support in [`./code/common/rich`](./code/common/rich).

* A build system for TypeScript, SCSS and less orthodox formats - see [`./code/build`](./code/build).

## Website code

What I call here "website code" is code specific to my website.

The website is split into logically independent bundles (these are not bundles in the usual JavaScript sense, although they initially were - see [here](./code/build#typescript)). The "core" bundle can be rendered both on the server and in the browser and its functionality is restricted to what can work in a modern browser without JavaScript. For example, the [`/files`](https://ivasilev.net/files) page must behave identically with and without JavaScript, and this is verified using [end-to-end tests](./code/testing/e2e/test_files.ts).

The server-side aspect is explained in [`./code/server`](./code/server), while the client-side aspect is explained in [`./code/client/core`](./code/client/core).

The other bundles are part of the "playground": a collection of interactive pages that, because of their interactivity, rely on client-side JavaScript.

* The array sorting visualization bundle is in [`./code/client/array_sorting`](./code/client/array_sorting).

* The univariate interpolation bundle is in [`./code/client/univariate_interpolation`](./code/client/univariate_interpolation).

* The Breakout bundle is in [`./code/client/breakout`](./code/client/breakout).

* The fleeing button bundle is in [`./code/client/fleeing_button`](./code/client/fleeing_button).
