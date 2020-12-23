import { s } from '../../../common/support/svg.js'

export function arrowMarker({ id, fillColor }: { id: string, fillColor?: string }) {
  return s(
    'marker',
    {
      id: id,
      refX: '5.5',
      refY: '1.5',
      markerWidth: '4',
      markerHeight: '3',
      orient: 'auto',
      fill: fillColor // HACK: There seems to be no way to set the marker stroke color using CSS
    },
    s('path', { d: 'M 0 0 L 4 1.5 L 0 3 z' })
  )
}
