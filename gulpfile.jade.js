'use strict';

const jade = require('jade');

const jsTransformer = require('jstransformer'),
      katexTransformer = require('jstransformer-katex'),
      highlightTransformer = require('jstransformer-highlight');

const katex = jsTransformer(katexTransformer),
    highlight = jsTransformer(highlightTransformer);

jade.filters.katex = function (input, config) {
    if (!('displayMode' in config))
        config.displayMode = true;

    if (!('nowrap' in config))
        config.nowrap = false;

    const result = katex.render(input, { displayMode: config.displayMode }).body;

    if (config.nowrap)
        return result;
    else
        return `<p>${result}</p>`;
};

jade.filters.highlight = function (input, config) {
    if (!('nowrap' in config))
        config.nowrap = false;

    const result = highlight.render(input, { lang: config.lang }).body;

    if (config.nowrap)
        return result;
    else
        return `<pre><code>${result}</code></pre>`;
};

module.exports = jade;
