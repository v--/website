import { ComponentStateSource, PotentialComponent, XMLComponent } from '../rendering/component.js'

// This is in a separate file because proper sanity checks are not done
// and it's nearly impossible to distinguish an HTML component from an
// SVG component. So this is an "extension" to the rendering library.
export class SVGComponent extends XMLComponent {
  namespace = 'http://www.w3.org/2000/svg'

  static safeCreate(type: string, stateSource?: ComponentStateSource, ...children: PotentialComponent[]): SVGComponent {
    return super.safeCreate(type, stateSource, ...children) as SVGComponent
  }
}

export function s(
  type: string,
  stateSource?: ComponentStateSource,
  ...children: PotentialComponent[]
): SVGComponent {
  return SVGComponent.safeCreate(type, stateSource, ...children)
}
