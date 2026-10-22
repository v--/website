# Heart rate estimation

This is the code for the heart rate estimation page at <https://ivasilev.net/playground/heart-rate>.

The README in the [root directory](../../../) contains references to important bits of documentation that may aid in understanding the code.

## Overview

The entry point is [`./index.ts`](./index.ts), which takes care of the rendering code (the component system is explained in the README file in [`../../common/rendering`](../../common/rendering)). The computations (described below) are offloaded to [`./worker.ts`](./worker.ts).

The worker interacts with the main process by passing messages based on updates to a pair of [`StateStore`](../../common/support/state-store.ts) instances. The working of a state store is explained [here](../../common/observable#state-store).

The following may be of interest:

* The ECG simulation code can be found in [`./simulation.ts`](./simulation.ts).

* The "evolution" code that takes care of real-time updates can be found in [`./evolution.ts`](./evolution.ts).

* The code for HR and HRV estimation can be found in [`./estimation.ts`](./estimation.ts).
