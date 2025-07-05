# Univariate interpolation bundle

This is the code for the univariate interpolation visualization at https://ivasilev.net/playground/univariate_interpolation

The [root directory](../../../) contains references to important bits of documentation that may aid in understanding the code.

## Overview

I believe that there is nothing subtle in this code bundle.

The entry point is [`./index.ts`](./index.ts), which hopefully makes the rendering code clear. This is run-of-the-mill reactive component manipulation, which is explained in [`../../common/rendering`](../../common/rendering).

The state revolves around the [`KnotMapping`](../../common/math/numeric/knot_mapping.ts) class, which is determined by clicking the sage and which determines the interpolation/approximation functions. It is stored in a [`StateStore`](../../common/support/state_store.ts) instance, the working of which is explained [here](../../common/observable#state-store).

The interpolation code should be straightforward. It is based on numeric analysis code from [`../../common/math/numeric`](../../common/math/numeric).
