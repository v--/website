# Translation

We support translating arbitrary strings in a flexible way. What may seem like an overcomplication now is in fact a basis for a future multilingual blog.

## Translation specifications

The [ITranslationSpec](./types.ts) interface contains everything necessary for translation - a translation bundle id, a key and a context for substituting variables. Substitution is handles by the rich text system from [`../rich`](../rich).

Here is a simple example from [`../components/sidebar.ts`](../components/sidebar.ts):
```
const _ = env.gettext$

c('button',
  ...
  title: _({ bundleId: 'core', key: 'sidebar.button.collapse' })
  ...
)
```

The `gettext$` method accepts an `ITranslationSpec` and creates an observable that updates the translated string once the active language changes.

## Plain and rich text

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

For the raw format, see [here](../../build#translations).

This builds into translation maps, which have the simpler form
```
{
  ...
  "sidebar.button.collapsed": "Collapse sidebar",
  ...
}
```

In case `entryKind` is set to `rich`, the string is treated as Markdown, and the translation map will contain the corresponding rich text AST.

## gettext

The [gettext](./gettext.ts) function is at a lower level and requires a resolved translation map.

Its main purpose is to ensure consistency. Each translated strings can be either plain or rich text. Based on its `rich` and `coerce` options, upon encountering a translation of the unexpected kind, `gettext` either throws an incompatibility error or converts between plain-text and rich-text translations.

These options are available to all functions wrapping `gettext`.
