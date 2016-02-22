'use strict';

const jade = require('jade');

const jsTransformer = require('jstransformer'),
      katexTransformer = require('jstransformer-katex'),
      highlightTransformer = require('jstransformer-highlight');

const katex = jsTransformer(katexTransformer),
    highlight = jsTransformer(highlightTransformer);

jade.filters.katex = function (input, config) {
    if (config.displayMode === undefined)
        config.displayMode = true;

    return katex.render(input, { displayMode: config.displayMode }).body;
};

jade.filters.highlight = function (input, config) {
    return highlight.render(input, { lang: config.lang }).body;
};

module.exports = jade;
