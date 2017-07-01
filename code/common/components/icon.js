const { XMLComponent } = require('common/component')

class SVGComponent extends XMLComponent {
    get namespace() {
        return 'http://www.w3.org/2000/svg'
    }
}

module.exports = function icon({ sorted = false }) {
    const iconName = sorted ? 'images/icons.svg#sort-descending' : 'images/icons.svg#sort-ascending'

    return SVGComponent.safeCreate('svg', { viewBox: '0 0 20 20' },
        SVGComponent.safeCreate('use', { 'href': iconName })
    )
}
