const AbstractXMLComponent = require('framework/components/xml');
const { createComponent } = require('framework/c');

class SVGComponent extends AbstractXMLComponent {
    get namespace() {
        return 'http://www.w3.org/2000/svg';
    }
}

module.exports = function icon({ options }) {
    const iconName = options.get('sorted', false) ?
        'images/icons.svg#sort-descending':
        'images/icons.svg#sort-ascending';

    function toggleSorted() {
        options.set('sorted', !options.get('sorted', false));
    }

    return createComponent(SVGComponent, 'svg', { viewBox: '0 0 20 20', click: toggleSorted },
        createComponent(SVGComponent, 'use', { 'href': iconName })
    );
};
