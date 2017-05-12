const { c } = require('common/component');

module.exports = async function icon({ db, options }) {
    const icons = await db.getIcons();
    const icon = options.get('sorted', false) ?
        icons['sort-descending'] :
        icons['sort-ascending'];

    function toggleSorted() {
        options.set('sorted', !options.get('sorted', false));
    }

    return c('svg', { viewBox: '0 0 20 20', click: toggleSorted },
        c('path', { d: icon })
    );
};
