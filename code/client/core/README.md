# Core bundle

This directory contains code required for the interactivity of the base website and of the other bundles.

Understanding the component system in [`../../common/rendering`](../../common/rendering) is important, so reading the documentation there should ideally be done before reading this one. Familiarity with [RxJS](https://rxjs.dev/) or with the observable system in [`../../common/observable`](../../common/observable) is also important.

## Routing service

The routing service ensures page (re)rendering works smoothly and, more importantly, it does a lot to aid error recovery. The code should be clear enough about all the cases we try to handle.

What is specific to the client-side environment is that the `processPageChange` method not only preloads data (like its parent class), but it emits a value to the `pageUnload$` observable, which is crucial for unsubscribing from observables all over the place in the other bundles. The latter is a prerequisite for the [`StateStore`](../../common/support/state_store.ts) class used actively in the other bundles.
