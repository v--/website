const { svg } = require('common/component');

module.exports = async function icon({ db, options }) {
    const icons = await db.getIcons();
    const icon = options.get('sorted', false) ?
        icons['sort-descending'] :
        icons['sort-ascending'];

    function toggleSorted() {
        options.set('sorted', !options.get('sorted', false));
    }

    return svg('svg', { viewBox: '0 0 20 20', click: toggleSorted },
        svg('path', { d: icon })
    );
};
