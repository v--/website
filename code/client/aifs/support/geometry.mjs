export class Vector {
  constructor (x, y) {
    this.x = x
    this.y = y
  }

  add (other) {
    return new Vector(this.x + other.x, this.y + other.y)
  }

  innerProduct (other) {
    return this.x * other.x + this.y * other.y
  }

  get norm () {
    return Math.sqrt(this.innerProduct(this))
  }

  get inverse () {
    return new Vector(-this.x, -this.y)
  }

  get positiveAngle () {
    if (this.x === 0 && this.y === 0) {
      return 0
    }

    return Math.acos(this.x / this.norm)
  }
}

export class Rect {
  // Corners
  constructor (bl, br, tr, tl) {
    this.bl = bl
    this.br = br
    this.tr = tr
    this.tl = tl
  }

  get positiveAngle () {
    return this.br.add(this.bl.inverse).positiveAngle % (Math.PI / 2)
  }

  get width () {
    return this.br.add(this.bl.inverse).norm
  }

  get height () {
    return this.tr.add(this.br.inverse).norm
  }
}

export class AffineTransform {
  constructor (x, y, free) {
    this.x = x
    this.y = y
    this.free = free
  }

  transformVector (vector) {
    return new Vector(
      vector.innerProduct(this.x) + this.free.x,
      vector.innerProduct(this.y) + this.free.y
    )
  }

  transformRect (rect) {
    return new Rect(
      this.transformVector(rect.bl),
      this.transformVector(rect.br),
      this.transformVector(rect.tr),
      this.transformVector(rect.tl)
    )
  }
}
