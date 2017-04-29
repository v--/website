const c = require('common/component');

module.exports = function index({ contents }) {
    return c('html', { lang: 'en-US' },
        c('head', null,
            c('title', null, 'ivasilev.net'),
            c('meta', { charset: 'UTF-8' }),
            c('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }),
            c('link', { rel: 'icon', href: 'images/favicon.png' }),
            c('link', { rel: 'stylesheet', href: 'styles/index.css' }),
            c('script', { src: 'code/core.js' }),
            c('script', { src: 'http://localhost:35729/livereload.js' })
        ),

        c('body', null,
            c('aside', null, 'navigation'),
            c('main', null, ...contents)
        )
    );
};
