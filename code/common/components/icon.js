const { XMLComponent } = require('common/component')
const icons = require('common/icons')

class SVGComponent extends XMLComponent {
    get namespace() {
        return 'http://www.w3.org/2000/svg'
    }
}

module.exports = function icon({ name, class: classNames, rotate = 0, verticalFlip = false, horizontalFlip = false }) {
    const rootState = { class: classNames ? `icon ${classNames}` : 'icon', viewBox: '0 0 24 24' }
    const transforms = []

    if (verticalFlip)
        transforms.push('scaleY(-1)')

    if (horizontalFlip)
        transforms.push('scaleX(-1)')

    if (rotate)
        transforms.push(`rotate(${rotate}deg)`)

    if (transforms.length > 0)
        rootState.style = `transform: ${transforms.join(' ')};`

    return SVGComponent.safeCreate('svg', rootState,
        SVGComponent.safeCreate('path', { d: icons[name] })
    )
}
