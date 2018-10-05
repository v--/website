import { Vector, AffineTransform } from '../support/geometry.mjs'

export default Object.freeze({
  name: 'Cantor dust',
  date: '2018-10-06',
  transformList: [
    new AffineTransform(
      new Vector(1 / 3, 0),
      new Vector(0, 1 / 3),
      new Vector(0, 0)
    ),

    new AffineTransform(
      new Vector(1 / 3, 0),
      new Vector(0, 1 / 3),
      new Vector(0, 2 / 3)
    ),

    new AffineTransform(
      new Vector(1 / 3, 0),
      new Vector(0, 1 / 3),
      new Vector(2 / 3, 0)
    ),

    new AffineTransform(
      new Vector(1 / 3, 0),
      new Vector(0, 1 / 3),
      new Vector(2 / 3, 2 / 3)
    )
  ]
})
