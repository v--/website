import { Vector, AffineTransform } from '../support/geometry.mjs'

export default Object.freeze({
  name: 'Dispersion',
  date: '2018-10-06',
  transformList: [
    new AffineTransform(
      new Vector(1 / 2, 0),
      new Vector(0, 1 / 2),
      new Vector(9 / 10, 0)
    ),

    new AffineTransform(
      new Vector(1 / 2, 1 / 16),
      new Vector(1 / 8, 1 / 2),
      new Vector(1 / 2, 0)
    ),

    new AffineTransform(
      new Vector(1 / 2, 1 / 32),
      new Vector(1 / 32, 1 / 2),
      new Vector(0, 1 / 2)
    )
  ]
})
