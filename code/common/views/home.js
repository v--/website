const { h, f } = require('common/component');

const icon = require('common/components/icon');

module.exports = {
    fetchData() {
        return null;
    },

    component() {
        return h('div', null,
            h('h1', null, 'stuff'),
            f(icon)
        );
    }
};
