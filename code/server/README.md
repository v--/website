# Server code

This directory features a simple web server based on node's builtin libraries. It was written in 2017 to replace the [vibe.d](https://vibed.org/) server I was running at the time. My intention was for the website to be able to perform both server-side and client-side rendering of the same virtual components. Understanding the component system in [`../common/rendering`](../common/rendering) is important for understanding how it is used, so reading the documentation there should be a priority over this one.

## Overview

The main class is [`HttpServer`](./http/server.ts), which wraps a node `http.Server` and, based on the router, renders HTML or JSON responses.

The entry point is [`./index.ts`](./index.ts), which does the following:
1. Reads and validates [`../config/active.json`](`../config/active.json`).
2. Creates a `HttpServer` instance with this configuration.
3. Binds a signal handler for configuration reloading.
4. Binds signal handlers for terminating the server.
5. Starts the server instance.

`HttpServer` does the following:

1. Upon creation, it initializes a [`ServerServiceManagerFactory`](./services/manager.ts). This factory is later used to create service managers, which take care of reading and validating data used by the website (see the next section).

2. When the server is started via its `start` method, it does the following:
    1. It replaces the process' title so that we can `kill` the process.
    2. It performs initialization of the aforementioned factory.
    3. Finally, it binds node's server to our custom request handlers.

3. Upon receiving a `NodeServerMessage` representing an HTTP request, we run the code logic:
    1. We parse the URL and create a [`UrlPath`](../common/support/url_path.ts) object.
    2. We parse some HTTP headers via the [`getPreferredLanguage`](./http/languages.ts) and [`parsePreferenceHeader`](./http/preferences.ts) functions.
    3. We use the manager factory to create a `ServerServiceManager` instance based on whether the headers require mock data (see [`../testing`](../testing)).
    4. We create a [`ServerWebsiteEnvironment`](./environment.ts) instance that is to be injected into factory components.
    5. We use the [`serverRouter`](./router.ts) function to create a [`ServerResponse`](./http/response.ts) object.
    6. Finally, we render this response object and send it to the user.

## Services

On the server side, the services in [`./services`](./services) take care of reading the file system and serving structured data over at the endpoints at the endpoints in [`/api`](https://ivasilev.net/api).

The website does not allow user input, nor does it need big batches of structured data, so we do not use a database.

* We did, long ago, use Postgres to store daily currency conversion rates for a forex prediction visualization (see [here](https://github.com/v--/website/tree/46e9d45caef6c7f6606fa048871a0601509b5f6a/source/controllers/forex.d) and [here](https://github.com/v--/website/tree/46e9d45caef6c7f6606fa048871a0601509b5f6a/app/scripts/controllers/code/forex_ctrl.js)). That has been abandoned long ago because I did not have the time required to delve into financial mathematics.

* More recently, we had a thumbnail service (see [here](https://github.com/v--/website/tree/2e90d288f846e1a3fae9e6ca62f6fbe474cfc9a7/code/server/commands/thumbnailer.js)) that maintained its own directory hierarchy. That was abandoned because, due to changing the underlying storage mechanism, I could no longer afford attaching photo directories to the website's file system.

## Rich text

The [file service](./services/files.ts) lists the contents of a directory, and, if the directory contains either `.README.md` or `.README.html`, it parses them and serves an AST that can be rendered. Consult the rich text module in [`../common/rich`](../common/rich) regarding the general approach, as well as the server-specific code that adapts Markdown and HTML syntax trees.

## Rehydration data

The term "rehydration" refers, roughly, to the ability to bind a virtual DOM tree to an existing real DOM tree created via server-side rendering. We have not implemented that because it would introduce an additional maintenance burden.

Instead, we do full-fledged initial rendering on the client side, which replaces the identical server-side rendered DOM tree. The rendered page contains "rehydration data", which is fed into the client-side service manager and cached so that the initial rendering does not fetch additional data.

The code for creating this data can be found in [`./rehydration.ts`](./rehydration.ts).

There is one substantial difference between server-side and client-side rendering, however. For the playground pages, the [`ServerPageService`](./services/pages.ts) resolves a static placeholder page, while the [`ClientPageService`](../client/core/services/pages.ts) fetches the corresponding playground page and renders it. The reason is that, since the playground pages are interactive, rendering them on the server is largely meaningless.
