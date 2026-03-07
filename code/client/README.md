# Client code

This directory contains code intended to be used only on the client side. The code is split into isolated bundles. The TypeScript files in this directory are "entry points".

## Overview

The entry point loaded by the browser is [`./runtime.ts`](./runtime.ts). In it, we do the following:

1. We wait for the `readystatechange` event to fire a `complete` state, or directly use `document.readyState` if it is `complete`.

2. We try to read rehydration data (see [here](../server#rehydration-data)) and use it to initialize the [`ClientServiceManager`](./core/services/manager.ts). If no rehydration data can be read, we simply fetch the corresponding data from the server via API calls.

3. Once we have a service manager initialized, we use it to initialize a [`ClientWebsiteEnvironment`](./environment.ts) that will get injected into the components.

4. We create a [`ClientRoutingService`](./core/routing_service.ts), which does a lot of essential work. We describe it next.

5. Finally, we subscribe to various events and delegate the job of handling them to the routing service.
