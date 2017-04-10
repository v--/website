const index = require('common/components/index');

module.exports = async function view() {
    return function home({ h }) {
        return h(index, null,
                h('div', null,
                    h('h1', null, 'stuff'),
                    h('h2', null, 'more stuff')
            )
        );
    };
};
