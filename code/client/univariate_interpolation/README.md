# Univariate interpolation bundle

This is the code for the univariate interpolation visualization at https://ivasilev.net/playground/univariate-interpolation

The README in the [root directory](../../../) contains references to important bits of documentation that may aid in understanding the code.

__Note:__ "Code bundle" here has a specific meaning as an isolated module, see [here](./build/#typescript).

## Overview

I believe that there is nothing subtle in this code bundle.

The entry point is [`./index.ts`](./index.ts), which hopefully makes the rendering code clear (the component system is explained in the README file in [`../../common/rendering`](../../common/rendering)).

The state revolves around a [`KnotMapping`](../../common/math/numeric/knot_mapping.ts) class instance, which determines a set of points in the plane that the interpolating function's graph should pass through. The knot mapping is determined by clicking the stage. It is stored in a [`StateStore`](../../common/support/state_store.ts) instance, the working of which is explained [here](../../common/observable#state-store).

The interpolation code should be straightforward. It is based on numeric analysis code from [`../../common/math/numeric`](../../common/math/numeric).
