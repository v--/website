const { XMLComponent } = require('common/component')

class SVGComponent extends XMLComponent {
    get namespace() {
        return 'http://www.w3.org/2000/svg'
    }
}

module.exports = function icon({ name, rotate = 0, verticalFlip = false, horizontalFlip = false }) {
    const rootState = { class: 'icon', viewBox: '0 0 24 24' }
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
        SVGComponent.safeCreate('use', { href: `images/icons.svg#${name}` })
    )
}
