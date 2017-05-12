const { h } = require('common/component');

const icon = require('common/components/icon');

module.exports = async function view() {
    return h('div', null,
        h('h1', null, 'stuff'),
        h(icon)
    );
};
