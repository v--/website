import { XMLComponent } from '../rendering/component'

// This is in a separate file because proper sanity checks are not done
// and it's nearly impossible to distinguish an HTML component from an
// SVG component. So this is an "extension" to the rendering library.
export class SVGComponent extends XMLComponent {
  get namespace () {
    return 'http://www.w3.org/2000/svg'
  }
}

export const s = XMLComponent.safeCreate.bind(SVGComponent)
