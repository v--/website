import { NotImplementedError } from '../../../common/errors.js'

export default class Collision {
  getStateUpdates () {
    throw new NotImplementedError()
  }

  get distance () {
    throw new NotImplementedError()
  }
}
