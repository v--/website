# Icon store

We use [Font Awesome](https://fontawesome.com/) icons in an unconventional way.

## Extracting the icons

Our build system takes a file containing a JSON list of icon names and creates an icon reference, [`IIconRef`](../common/icon_store/types.ts) (see [here](../../build/#icon-references)).

This reference is a map from icon names to [`IIconSpec`](../common/icon_store/types.ts) objects. Each spec has `viewBox` and `path` fields, roughly fitting the following SVG:
```
<svg viewBox="${viewBox}">
  <path d="${path}" />
</svg>
```

This gives a hint of how the icons are drawn by the [`icon`](../components/icon.ts) component.

Embedding SVG icons in such a way allows us to both customize any SVG/CSS properties easily, and saves the need to load a lot of `.svg` files (or a large font file).

## Icon store

The [`IconStore`](./store.ts) class simply stores and retrieves icon references.

Similarly to how translation packages work (see [here](../translation#translation-packages)), the `IconStore` class stores an `IIconRefPackage` - a list of icon reference maps indexed by ids, and the [`WebsiteEnvironment`](../environment.ts) class provides tools to maintain it between page reloads.
