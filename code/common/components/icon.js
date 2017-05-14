const { svg } = require('common/component');

module.exports = function icon({ options }) {
    // const icons = await db.getIcons();
    const iconName = options.get('sorted', false) ?
        'images/icons.svg#sort-descending':
        'images/icons.svg#sort-ascending';

    function toggleSorted() {
        options.set('sorted', !options.get('sorted', false));
    }

    return svg('svg', { viewBox: '0 0 20 20', click: toggleSorted },
        svg('use', { 'href': iconName })
    );
};
