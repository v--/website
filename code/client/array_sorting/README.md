# Array sorting bundle

This is the code for the array sorting visualization at https://ivasilev.net/playground/array-sorting

The README in the [root directory](../../../) contains references to important bits of documentation that may aid in understanding the code.

__Note:__ "Code bundle" here has a specific meaning as an isolated module, see [here](./build/#typescript).

## Overview

The entry point is [`./index.ts`](./index.ts), which hopefully makes the rendering code clear. The current state is stored in a [`StateStore`](../../common/support/state_store.ts) instance, the working of which is explained [here](../../common/observable#state-store).

### Sorting

Here is a brief overview of the sorting itself:

1. We have a collection of sorting algorithms in [`./algorithms`](./algorithms). Each of them contains metainformation, as well as a `sort` method that should sort an array.

2. The arrays sorted by each algorithm are not JavaScript `Array` instances, but instead [`SortableArray`](./support/sortable_array.ts) instances. Sortable arrays can only be mutated via the `recordComparison` method. Each call to this method records the comparison of two values, with a third parameter determining whether they should be swapped.

3. Once the sorting algorithm completes, we have a list of comparison that is used to instantiate the [`SortingTimeline`](./support/timeline.ts) class. The timeline is able to extract snapshots at discrete moments; each snapshot contains an array and the latest action applied to it.

4. All requires sorting timelines are initialized statically in [`./constants.ts`](./constants.ts).

### Visualization

With timelines for all possible arrays on the page, we can easily run and pause the arrays features on individual sorting cards Each card corresponds to an algorithm and contains several arrays that the algorithm should sort. This is run-of-the-mill reactive component manipulation, which is explained in [`../../common/rendering`](../../common/rendering).
