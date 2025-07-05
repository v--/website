# Rich text

Plain text is rarely sufficient. This leads to a plethora of incompatible rich text formats. We use here our own AST-based rich text system based on Markdown, with extensions based on [MathML](https://developer.mozilla.org/en-US/docs/Web/MathML).

A schema for the AST can be found in [`./types.ts`](./types.ts). Examples can be found in [`./test_conversion.ts`](./test_conversion.ts) and [`../../server/markdown/test_rich.ts`](../../server/markdown/test_rich.ts).

The MathML subsystem is flexible, but the type schema is quite loose. This is better discussed and explained in [`./mathml.ts`](./mathml.ts), which features several tools for easily building rudimentary MathML expressions. The latter module is used, for example, in the [`UnivariatePolynomial`](../math/algebra/univariate_polynomial.ts) and [`Spline`](../math/numeric/spline.ts) classes, as well as for denoting computational compexity in the [`ComplexityMathMLHelper`](../../client/array_sorting/support/complexity.ts) class.

## Markdown

Long story short, the code at [`../../server/markdown`](../../server/markdown) parses markdown via [CommonMark](https://commonmark.org/) and later converts the obtained AST into our rich text AST format.

The website previously used a custom Markdown parser. You can find a working one [here](https://github.com/v--/website/tree/7e244705189a213bc7e29d9ba4dfa34973a4e4f4/code/common/support/markdown/parser.js) and a much better but unfinished one [here](https://github.com/v--/website/tree/master/code/common/markdown/parser.ts).

There are two reasons why I decided to abandon that.

1. Markdown has a surprising amount subtleties, as can be seen in the [CommonMark Spec](https://spec.commonmark.org/). These make every parser incompatible, and sometimes I found myself wondering whether to parse indented text as a code block or as nested list. The custom parser was more of a burden than a good learning experience.

2. At some point I started thinking about setting up a blog, and being able to write mathematical expressions was a necessity. Thus, I was forced either to introduce another custom flavor of Markdown, or to abandon it altogether in favor of another approach.

I made the decision to develop on AST-based system that is flexible enough to handle both Markdown and HTML with MathML.

## Other formats

Another format that is partially supported is [LaTeX](https://www.latex-project.org/) via [TeX4ht](https://tug.org/tex4ht), which can be parsed by the code at [`../../server/html`](../../server/html). The latter acts as a general HTML parser (used for parsing `.README.html` files in the [server's file service](../../server/services/files.ts)), but only supports a Markdown-like limited subset of HTML, extended with MathML.

If that turns out easy enough, I may also experiment at some point with [plasTeX](https://github.com/plastex/plastex) or even possibly [typst](https://typst.app).

## Conversion to plain text

We support converting some part of the AST back to Markdown-based plain text in [`./conversion.ts`](./conversion.ts).
