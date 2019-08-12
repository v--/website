import { NotImplementedError } from '../../../common/errors.js'

export default class Entity {
  collides (_ball) {
    throw new NotImplementedError()
  }

  predictCollision (_ball) {
    throw new NotImplementedError()
  }
}
