import { XMLComponent } from '../rendering/component.js'

// This is in a separate file because proper sanity checks are not done
// and it's nearly impossible to distinguish an HTML component from an
// SVG component. So this is an "extension" to the rendering library.
export class SVGComponent extends XMLComponent {
  namespace = 'http://www.w3.org/2000/svg'

  /**
   * @param {string} type
   * @param {TComponents.IComponentStateSource} [stateSource]
   * @param {TComponents.IPotentialComponent[]} children
   * @returns {SVGComponent}
   */
  static safeCreate(type, stateSource, ...children) {
    return /** @type {SVGComponent} */ (super.safeCreate(type, stateSource, ...children))
  }
}

/**
 * @param {string} type
 * @param {TComponents.IComponentStateSource} [stateSource]
 * @param {TComponents.IPotentialComponent[]} children
 * @returns {SVGComponent}
 */
export function s(type, stateSource, ...children) {
  return SVGComponent.safeCreate(type, stateSource, ...children)
}
