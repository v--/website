# Fleeing button bundle

This is the code for the fleeing button page at https://ivasilev.net/playground/fleeing-button

The [root directory](../../../) contains references to important bits of documentation that may aid in understanding the code.

## Overview

I believe that there is nothing subtle in this code bundle.

The fleeing algorithm itself is explained and justified on the web page.

The entry point is [`./index.ts`](./index.ts) and the logic is concentrated in the [`fleeingButtonStage`](./components/fleeing_button_stage.ts) component. The component system is explained in [`../../common/rendering`](../../common/rendering).

The current stat is stored in a [`StateStore`](../../common/support/state_store.ts) instance, the working of which is explained [here](../../common/observable#state-store).
