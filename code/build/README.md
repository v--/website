# Builder

When I developed the website initially, [gulp.js](https://gulpjs.com/) was strong, and I relied on it because of its flexibility. It has long since stagnated, so at some point I have implements an equally flexible but fundamentally different build system from scratch.

## Workers and managers

A build worker accepts a source path and generates "build contexts", each containing a destination file's path and contents. All that a build worker needs is to implement the single-method [IBuildWorker interface](./build_worker.ts).

A build manager is instead an instance of the [BuildManager class](./build_manager.ts). A manager knows which files to watch (and ignore) and when to run BrowserSync (the latter requires some hacks - see the comments in [`./sync.ts`](./sync.ts) and [`../client/browsersync_injection.ts`](../client/browsersync_injection.ts)).

Various managers are initialized in [`./managers.ts`](./managers.ts), while [`./builder.ts`](./builder.ts) and [`./watcher.ts`](./watcher.ts) use these for (re)building the website.

## /public and /private

Built files are dumped into either [`../../public`](../../public) or [`../../private`](../../private). The first one is directly served by BrowserSync (or nginx in production) and the second one is loaded and used by the [server code](../server).

## Concrete workers

### TypeScript

The [code worker](./workers/code.ts) uses [SWC](https://swc.rs/) to strip the types from source files, optionally mangle any whitespace and dump the result into individual JavaScript files.

We mentioned in the [README in the root](../) that the client-side code is split into bundles. These are however not bundles in the sense of [WebPack](https://webpack.js.org/) or [Rollup](https://rollupjs.org/) (although this was the case a long time ago). Instead, the output JavaScript has the same structure as the source TypeScript.

We will explain the reason for this. Generally, websites using the aforementioned code bundlers are homogeneous masses of code represented via one giant code blob, the "bundle". Instead, this website is modular, and significant effort is required to make different bundled code blobs interact well. After encountering several bugs related to state management, I decided to abort bundlers and instead rely on the then-new ability of browsers to [load JavaScript modules recursively](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules).

This works well since 2018.

We use the TypeScript compiler only as part of the linting process, and hence the worker is not concerned with it. We have previously relied on it for building the code (see [here](https://github.com/v--/website/tree/9a2a23245d8170595f78ee49f63a63a6c3a5d007/build/code.ts)), however that turned out cumbersome and, unfortunately, at some point it also became error-prone as it began to occasionally skip building new versions of files.

### SCSS

The [style worker](./workers/styles.ts) uses [Dart Sass](https://sass-lang.com/dart-sass/) to bundle up blobs of CSS. Unlike for the code, no problems are encountered with bundling here because the style sheets are by their nature non-modular and their effect is global.

### SVG

There are [SVG rendering](./workers/svg_render.ts) and [SVG optimization](./workers/svg_opt.ts) workers for, unsurprisingly, SVG files.

### Open graph images

There is a [generator](./workers/og_images.ts) for [Open Graph protocol](https://ogp.me/) images.

We take an SVG image with a `${title}` string and replace that string with internationalized text based on the `config.json` file in [`../../data/og_images`](../../data/og_images) (consult the README file there for some details). The resulting SVG is then rendered to PNG via the [resvg-js](https://github.com/thx/resvg-js) library.

### Icon references

In order to build [`IIconSpec`](../common/icon_store/types.ts) objects, the [IconRef worker](./workers/icon_refs.ts) relies on a directory of JSON files, [`../../data/icon_ref`](../../data/icon_ref). Each of the files is a list of [FontAwesome](https://fontawesome.com/) icon names. The icon builder extracts the `viewBox` and `path` specification for each icon and dumps them in the format used by the website.

Icon references are discussed in [`../common/icon_store`](../common/icon_store).

### Translation maps

Slightly more intriguing is the [translation map worker](./workers/translation_maps.ts). The corresponding source directory, [`../../data/translation`](../../data/translation), consists of subdirectories, each containing per-language files with translations. These translations are either plain strings or Markdown strings (which are rendered by commonmark as explained in [`../common/rich`](../common/rich/)), with multiline strings encoded as arrays.

How these maps are used for translation is discussed in [`../common/translation`](../common/translation).

### Assets

Finally, the [asset worker](./workers/assets.ts) simply copies files from [`../../client/assets`](../../client/assets) into [`../../public`](../../public).
