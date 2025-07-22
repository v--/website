# Translation

We support translating arbitrary strings in a flexible way. What may seem like an overcomplication now is in fact a basis for a future multilingual blog.

## Translation specifications

The [`IGettextSpec`](./gettext.ts) interface contains everything necessary for translation - a translation bundle ID and key, and optionally a context for substituting variables, as well as options for coercing to either plain or rich text. Substitution is handled by the rich text system from [`../rich`](../rich).

Here is a simple example from [`../components/sidebar.ts`](../components/sidebar.ts):
```
const _ = env.gettext.bindToBundle('core')

h('button',
  ...
  title: _('sidebar.button.collapse')
  ...
)
```

The `_` function is now bound to the core translation bundle. It can take string and return an observable that updates the translated string once the active language changes. Furthermore, it can work with `IPartialGettextSpec` objects; the following produces the same result:
```
title: _({
  bundleId: 'core',
  key: 'sidebar.button.collapse',
  coerce: true,
  context: {}
})
```

## GetText class

The underscore above is an instance of the [`BoundGetText`](./gettext.ts) class. Like the [`GetText`](./gettext.ts) class, it is an extendable function (see [`../support/extendable_function.ts`](../support/extendable_function.ts)), and so it can be called, but it also has other useful methods:

1. `_(...)` is equivalent to `_.plain$(...)`; it creates an observable expecting a plain text translation.
2. `_.plain(...)` instead translates a string instantly based on the currently set language and currently loaded translation package (see the next section).
3. Similarly, we have `_.rich(...)` and `_.rich$(...)`, which enforce a rich text result either by coercion or by throwing an error.

## Translation packages

Each page declares its required translation bundles in the router, and so we know which one we need. The `GetText` class stores an `ITranslationPackage` - a list of translation maps indexed by a language and bundle ID. The [`WebsiteEnvironment`](../environment.ts) class provides tools to maintain it across navigation.

## Plain and rich text sources

The above example sources the translation, which in its raw unbuilt form looks as follows:
```
{
  ...
  "sidebar.button.collapse": {
    "entryKind": "plain",
    "content": "Collapse sidebar"
  },
  ...
}
```

For the raw format, see [here](../../build#translation-maps).

This builds into translation maps, which have the simpler form
```
{
  ...
  "sidebar.button.collapsed": "Collapse sidebar",
  ...
}
```

In case `entryKind` is set to `rich`, the string is treated as Markdown, and the translation map will contain the corresponding rich text AST.
