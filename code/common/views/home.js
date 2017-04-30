const c = require('common/component');

function h2({ options }) {
    return c('h2', null, options.get('text', 'more stuff'));
}

module.exports = async function view() {
    return c('div', null,
        c('h1', null, 'stuff'),
        c(h2)
    );
};
