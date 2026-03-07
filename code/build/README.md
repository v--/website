# Builder

When I developed the website initially, [gulp.js](https://gulpjs.com/) was strong, and I relied on it because of its flexibility. It has long since stagnated, so at some point I have implements an equally flexible but fundamentally different build system from scratch.

## Workers and managers

A build worker accepts a source path and generates "build contexts", each containing a destination file's path and contents. All that a build worker needs is to implement the single-method [IBuildWorker interface](./build_worker.ts).

A build manager is instead an instance of the [BuildManager class](./build_manager.ts). A manager knows which files to watch (and ignore) and when to run BrowserSync (the latter requires some hacks - see the comments in [`./sync.ts`](./sync.ts) and [`../client/browsersync_injection.ts`](../client/browsersync_injection.ts)).

Various managers are initialized in [`./managers.ts`](./managers.ts), while [`./builder.ts`](./builder.ts) and [`./watcher.ts`](./watcher.ts) use these for (re)building the website.

## /build/public, /build/private and /build/intermediate

Built files are dumped into one of the aforementioned subdirectories of [`../../build`](../../build). The public directory is served by BrowserSync (or nginx in production); the private one is loaded and used by the [server code](../server), while the intermediate one is used during development and when creating code bundles.

## Concrete workers

### TypeScript

The [code worker](./workers/code.ts) uses [SWC](https://swc.rs/) to strip the types from source files, optionally mangle any whitespace and dump the result into individual JavaScript files.

We mentioned in the [README in the root](../) that the client-side code is split into bundles. The directory structure produced by SWC is used directly during development, but for production we use [Rollup](https://rollupjs.org/) to combine that code into larger bundles with shared chunks.

We use the TypeScript compiler only as part of the linting process, and hence the worker is not concerned with it. We have previously relied on it for building the code (see [here](https://github.com/v--/website/tree/9a2a23245d8170595f78ee49f63a63a6c3a5d007/build/code.ts)), however that turned out cumbersome and, unfortunately, at some point it also became error-prone as it began to occasionally skip building new versions of files.

### SCSS

The [style worker](./workers/styles.ts) uses [Dart Sass](https://sass-lang.com/dart-sass/) to bundle up blobs of CSS. Unlike for the code, no problems are encountered with bundling here because the style sheets are by their nature non-modular and their effect is global.

### SVG

There is an [SVG rendering](./workers/svg_render.ts) worker.

### Icon libraries

In order to build SVG libraries with reusable `<symbol>` tags for icons, the [IconLibrary worker](./workers/svg_libraries.ts) relies on a directory of JSON files, [`../../data/icon_library`](../../data/icon_library). Each of the files is a list of [FontAwesome](https://fontawesome.com/) icon names.

### Open graph images

There is a [generator](./workers/og_images.ts) for [Open Graph protocol](https://ogp.me/) images.

We take an SVG image with a `${title}` string and replace that string with internationalized text based on the `config.json` file in [`../../data/og_images`](../../data/og_images) (consult the README file there for some details). The resulting SVG is then rendered to PNG.

### Translation maps

Slightly more intriguing is the [translation map worker](./workers/translation_maps.ts). The corresponding source directory, [`../../data/translation`](../../data/translation), consists of subdirectories, each containing per-language files with translations. These translations are either plain strings or Markdown strings (which are rendered by commonmark as explained in [`../common/rich`](../common/rich/)), with multiline strings encoded as arrays.

How these maps are used for translation is discussed in [`../common/translation`](../common/translation).

### Assets

Finally, the [asset worker](./workers/assets.ts) simply copies files from [`../../client/assets`](../../client/assets) into [`../../public`](../../public).
