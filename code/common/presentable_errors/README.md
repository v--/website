# Presentable errors

We have an error hierarchy containing several dozens subclasses of [CoolError](../errors.ts), our custom error root.

One particular subclass requires special handling. The [PresentableError](./errors.ts) class has a special `encoded` attribute, containing an encoded error object adhering to the schemas in [`./types.ts`](./types.ts). This encoding contains translation keys for presenting the error to the user.

## Factory

Creating a presentable error requires such an encoding, but also requires the same messages in English for initializing the error instance. Translation in general is discussed in [`../translation`](../translation).

Since we support arbitrary translation keys from arbitrary translation bundles, we cannot foresee what keys need to be translated when creating a `PresentableError` instance. Furthermore, since errors can contain translation contexts featuring arbitrary strings, using English messages as translation keys would only partially solve the problem, at the cost of the error messages being fragile translation-wise.

We solve this via the [`PresentableErrorFactory`](./factory.ts) class. It accepts a translation cache that is assumed to have preloaded all translations required for creating an exception instance. The good part is that presentable errors only make sense in relation to user interaction, in which cases we have a translation service (and cache) available.
