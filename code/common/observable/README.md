# Observables

I started using an observable-based approach to rendering in 2017, with a home-baked Observable class (see [here](https://github.com/v--/website/tree/5df50822d5b35a86a5ac8d89c5ecb5ee813f8bdd/code/common/support/observable.mjs)) based on some obsolete (for that time) ideas. These observables later turned out to loosely resemble [RxJS](https://rxjs.dev/)'s Subjects.

After two years, after having worked with RxJS for some time, I decided to reimplement observables based on the corresponding [TC39 proposal](https://github.com/tc39/proposal-observable). Most of the code still used subjects for some time.

Several years later, this module features [`Observable`](./observable.ts), [`Subject`](./subject.ts), [`ReplaySubject`](./replay_subject.ts) and [`BehaviorSubject`](./behavior_subject.ts) classes mostly compatible with RxJS, with a lot of operators that can be found in [`./operators`](./operators). Furthermore, the TC39 proposal's test suite is run in [`./test_observable.ts`](./test_observable.ts), which ensures additional compatiblity.

Incompatibilities are specifically commented. For example, [`./operators/combine_latest.ts`](./operators/combine_latest.ts) explains how our implementation of `combineLatest` breaks compatibility RxJS's on purpose, since that enables us to use a pattern we fundamentally rely on in the component system in [`../rendering`](../rendering).

__Note:__ Just to be clear, I find observables to be an awkward abstraction. They leave a lot of questions unanswered (what should `takeUntil` do when its argument completes? how about `debounce`?) and often introduce unnecessary cognitive load (will `shareReplay` leak here?). Until a more elegant abstraction arises, however, observables may be the most powerful way to perform reactive updates.

## Subscription observers

Most of the heavy lifting is done in [`SubscriptionObserver`](./subscription_observer.ts), which wraps observers into a standardized object with proper error handling and recovery.

The class also features a static list of living observers, which we use to verify proper unsubscribing. For example, there is a [global unit test hook](../../testing/unit/global_hooks.ts) which verifies that there are no living observers after running a test and its teardown code.

## State store

The [`StateStore`](../support/state_store.ts) is a flexible reactive state container. Here is a simple usage example:
```
const unload$ = new Subject<void>();
const store = new StateStore(unload$, { velocity: 3, time: 2 })
const displacement$ = store.combinedState$.pipe(
  map(({ velocity, time }) => velocity * time)
)

store.keyedObservables.time.subscribe({
  next(time) {
    console.log('Time: ', time)
  }
})

displacement$.subscribe({
  next(displacement) {
    console.log('Displacement: ', displacement)
  }
})
```

Running `store.update({ time: 4 })` will trigger both subscriptions, but running `store.update({ velocity: 4 })` will only trigger the second one.

Once we are done, running `unload$.next()` will complete the exposed observables, ensuring automatic cleanup.

The state store is actively used on the playground pages, where [`ClientWebsiteEnvironment`](../../client/core/environment.ts)'s `pageUnload$` observable allows us to destroy active subscriptions upon page reload.
