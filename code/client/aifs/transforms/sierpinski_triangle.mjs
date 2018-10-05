import { Vector, AffineTransform } from '../support/geometry.mjs'

export default Object.freeze({
  name: 'Sierpinski triangle',
  date: '2018-10-06',
  transformList: [
    new AffineTransform(
      new Vector(1 / 2, 0),
      new Vector(0, 1 / 2),
      new Vector(0, 0)
    ),

    new AffineTransform(
      new Vector(1 / 2, 0),
      new Vector(0, 1 / 2),
      new Vector(0, 1 / 2)
    ),

    new AffineTransform(
      new Vector(1 / 2, 0),
      new Vector(0, 1 / 2),
      new Vector(1 / 2, 0)
    )
  ]
})
