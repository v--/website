# Core bundle

This directory contains code required for the interactivity of the base website and of the other bundles.

Understanding the component system in [`../../common/rendering`](../../common/rendering) is important for understanding how it is used, so reading the documentation there should be a priority over this one. Familiarity with [RxJS](https://rxjs.dev/) or with the observable system in [`../../common/observable`](../../common/observable) is also important.

## Overview

The entry point of the client-side is [`./index.ts`](./index.ts). We do the following:

1. We wait for the `readystatechange` event to fire a `complete` state, or uses `document.readyState` if it is `complete`.

2. We try to read rehydration data (see [here](../../server#rehydration)) and use it to initialize the [`ClientServiceManager`](./services/manager.ts). If no rehydration data can be read, we simply fetch the corresponding data from the server via API calls.

3. Once we have a service manager initialized, we use it to initialize a [`ClientWebsiteEnvironment`](./environment.ts) that will get injected into the components.

4. We create a [`ClientRoutingService`](./routing_service.ts), which does a lot of essential work. We describe it next.

5. Finally, we subscribe to various events and delegate the job of handling them to the routing service.

## Routing service

The routing service ensures page (re)rendering works smoothly and, more importantly, it does a lot to aid error recovery. The code should be clear enough about all the cases we try to handle.

What is specific to the client-side environment is that the `processPageChange` method not only preloads data (like its parent class), but it emits a value to the `pageUnload$` observable, which is crucial for unsubscribing from observables all over the place in the other bundles. The latter is a prerequisite for the [`StateStore`](../../common/support/state_store.ts) class used actively in the other bundles.
