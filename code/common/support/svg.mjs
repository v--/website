import { XMLComponent } from '../component'

export class SVGComponent extends XMLComponent {
  get namespace () {
    return 'http://www.w3.org/2000/svg'
  }
}
