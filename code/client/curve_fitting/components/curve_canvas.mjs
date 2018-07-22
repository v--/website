import { zip, range, product } from '../../../common/support/iteration'
import { join } from '../../../common/support/strings'
import { classlist } from '../../../common/support/dom_properties'
import { s } from '../../../common/support/svg'

function lagrangePolynomial (data) {
  const n = data.length - 1

  function basisPolynomial (k) {
    let wk = 1

    for (let i = 0; i <= n; i++) {
      if (i !== k) {
        wk *= data[k][0] - data[i][0]
      }
    }

    return function (x) {
      let w = 1

      for (let i = 0; i <= n; i++) {
        if (i !== k) {
          w *= x - data[i][0]
        }
      }

      return w / wk
    }
  }

  const basis = []

  for (let i = 0; i <= n; i++) {
    basis[i] = basisPolynomial(i)
  }

  return function (x) {
    let sum = 0

    for (let i = 0; i <= n; i++) {
      sum += data[i][1] * basis[i](x)
    }

    return sum
  }
}

export default function curveCanvas ({ width, height, data }) {
  const grid = Array.from(
    product(
      range(-width / 2, width / 2 + 1),
      range(-height / 2, height / 2 + 1)
    )
  )

  const viewBox = [
    -(width + 1) / 2,
    -(height + 1) / 2,
    width + 1,
    height + 1
  ]

  const dataLookup = new Set(data.map(point => point.join(',')))
  const polynomial = lagrangePolynomial(data)
  const x = Array.from(range(-(width + 1) / 2, (width + 1) / 2, 0.1))
  const y = x.map(x_ => polynomial(x_))

  return s(
    'svg',
    {
      class: 'curve-canvas',
      viewBox: viewBox.join(' ')
    },

    s(
      'g',
      { class: 'point-grid' },
      ...grid.map(point => s('circle', {
        class: classlist('grid-point', dataLookup.has(point.join(',')) && 'active'),
        r: '0.1',
        cx: String(point[0]),
        cy: String(point[1])
      }))
    ),

    s(
      'polyline',
      { class: 'largange-polynomial', points: join(' ', zip(x, y)) }
    )
  )
}
