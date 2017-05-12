const { c } = require('common/component');

const icon = require('common/components/icon');

module.exports = async function view() {
    return c('div', null,
        c('h1', null, 'stuff'),
        c(icon)
    );
};
