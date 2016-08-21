import jade from 'jade';

import jsTransformer from 'jstransformer';
import katexTransformer from 'jstransformer-katex';
import highlightTransformer from 'jstransformer-highlight';

const katex = jsTransformer(katexTransformer);
const highlight = jsTransformer(highlightTransformer);

jade.filters.katex = function (input, { displayMode = true, nowrap = false }) {
    const result = katex.render(input, { displayMode: displayMode }).body;

    if (nowrap)
        return result;
    else
        return `<p>${result}</p>`;
};

jade.filters.highlight = function (input, { lang, nowrap = false }) {
    const result = highlight.render(input, { lang: lang }).body;

    if (nowrap)
        return result;
    else
        return `<pre><code>${result}</code></pre>`;
};

export default jade;
