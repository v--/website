const { XMLComponent } = require('common/component')
const icons = require('common/icons')

class SVGComponent extends XMLComponent {
    get namespace() {
        return 'http://www.w3.org/2000/svg'
    }
}

module.exports = function icon(state) {
    const rootState = Object.assign({ viewBox: '0 0 24 24' }, state)

    if ('class' in state)
        rootState.class = `icon ${state.class}`
    else
        rootState.class = 'icon'

    return SVGComponent.safeCreate('svg', rootState,
        SVGComponent.safeCreate('path', { d: icons[state.name] })
    )
}
