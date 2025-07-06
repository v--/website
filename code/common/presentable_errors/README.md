# Presentable errors

We have an error hierarchy containing several dozens subclasses of [CoolError](../errors.ts), our custom error root.

One particular subclass requires special handling. The [PresentableError](./errors.ts) class has its cause set an [`IEncodedError`](./types.ts), a rehydratable specification of what went wrong. This specification uses `ITranslationSpec` objects, which we discuss in the README in [`../translation`](../translation).

Creating a presentable error requires such an encoding, but also requires some base error messages in English for initializing the error instance.

Since we support arbitrary translation keys from arbitrary translation bundles, we cannot foresee what keys need to be translated when creating a `PresentableError` instance. Thus, there is slight duplication, but the benefit is that we are able to show rich text errors to the end user.

Specifically for API errors, we have a [`translateEncoding`](./translate_encoding.ts) function, which creates a similarly structured encoded error, but with English strings rather than translation keys.
