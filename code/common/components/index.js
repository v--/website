module.exports = function index({ h, contents }) {
    return h('html', { lang: 'en-US' },
        h('head', null,
            h('title', null, 'ivasilev.net'),
            h('meta', { charset: 'UTF-8' }),
            h('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }),
            h('link', { rel: 'icon', href: 'images/favicon.png' }),
            h('link', { rel: 'stylesheet', href: 'styles/index.css' }),
            h('script', { src: 'code/core.js' }),
            h('script', { src: 'http://localhost:35729/livereload.js' })
        ),

        h('body', null,
            h('aside', null, 'navigation'),
            h('main', null, ...contents)
        )
    );
};

