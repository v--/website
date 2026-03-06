# Open graph image generation

This is template data required to generate [Open Graph protocol](https://ogp.me/) images for the different pages. For the build process, see [here](../../code/build#og-images).

The SVG files are manually written and are inter-connected via `symbol` and `use` tags. The only exception is the background, which is generated via [asymptote](https://github.com/vectorgraphics/asymptote) based on [`title_page.asy`](https://github.com/v--/notebook/blob/master/figures/title_page.asy) from my [Notebook](https://github.com/v--/notebook).

Creating the final images requires [Inkscape](https://inkscape.org/) for SVG rendering and [oxipng](https://github.com/oxipng/oxipng) for PNG optimization.
