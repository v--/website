const c = require('common/component');

module.exports = async function view() {
    return function home() {
        return c('div', null,
            c('h1', null, 'stuff'),
            c('h2', null, 'more stuff')
        );
    };
};
