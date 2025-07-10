# Breakout bundle

This is the code for the Breakout game at https://ivasilev.net/playground/breakout

The README in the [root directory](../../../) contains references to important bits of documentation that may aid in understanding the code.

__Note:__ "Code bundle" here has a specific meaning as an isolated module, see [here](./build/#typescript).

## Overview

An overview of how the game works is given on the web page. The code is structured so that it is easy to understand. The entry point is [`./index.ts`](./index.ts) and the user interaction code is concentrated in the [`breakout`](./components/breakout.ts) component. The component system is explained in [`../../common/rendering`](../../common/rendering).

### Evolution

The game logic is based on discrete-time state evolutions. The current state is stored a [`StateStore`](../../common/support/state_store.ts) instance, the working of which is explained [here](../../common/observable#state-store). All non-dynamic state is extracted as a `SCREAMING_SNAKE_CASE` constant in [`./constants.ts`](./constants.ts).

1. The ball evolves in accordance to the [`evolveBall`](./evolution/ball.ts) function, which gets invoked on intervals maintained by a [`animationFrameObservable`](../core/dom/observable.ts) observable. The `evolveBall` function contains the majority of game logic, modulo the ray intersection logic in [`./intersection.ts`](./intersection.ts) based on the geometric code from [`../../common/math/geom2d`](../../common/math/geom2d).

    The movement speed is fixed and adjusted based on the FPS, so that the speed does not double on 120Hz vs 60Hz, and does not halve during JavaScript's garbage collection.

2. The paddle evolution, governed by the [`evolvePaddle`](./evolution/paddle.ts) function, happens before ball evolution on every frame, and patches the current state before passing it to `evolveBall`.

    The paddle evolution takes care of paddle movement, which is toggled by holding the corresponding keyboard key or on-screen button.

3. Finally, brick evolution is governed by [`evolveBricks`](./evolution/bricks.ts) on regular intervals signaled by a [`timeInterval`](../../common/observable/operators/time_interval.ts) observable.
