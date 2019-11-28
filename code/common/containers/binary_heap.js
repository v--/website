import { CoolError } from '../../common/errors.js'
import { swap } from '../../common/support/iteration.js'
import { repr } from '../../common/support/strings.js'

export class BinaryHeapError extends CoolError {}
export class EmptyHeapError extends BinaryHeapError {}
export class NoSuchItemError extends BinaryHeapError {}

export class BinaryHeap {
  constructor ({ payload = [], weights = [], payloadMap = new Map() } = {}) {
    this._payload = payload
    this._weights = weights
    this._payloadMap = payloadMap
  }

  get isEmpty () {
    return this._payload.length === 0
  }

  _swap (i, j) {
    swap(this._payload, i, j)
    swap(this._weights, i, j)
    this._payloadMap[this._payload[i]] = i
    this._payloadMap[this._payload[j]] = j
  }

  _siftDown (start) {
    let node = start
    let leftChild = 2 * start + 1
    let rightChild = 2 * start + 2

    while (leftChild < this._payload.length) {
      let candidate = node

      if (this._weights[leftChild] < this._weights[node]) {
        candidate = leftChild
      }

      if (rightChild < this._payload.length && this._weights[rightChild] < this._weights[candidate]) {
        candidate = rightChild
      }

      if (candidate === node) {
        break
      }

      this._swap(node, candidate)
      node = candidate
      leftChild = 2 * node + 1
      rightChild = 2 * node + 2
    }
  }

  insert (item, weight = item) {
    let node = this._payload.length
    let parent = Math.ceil(node / 2) - 1

    this._payload.push(item)
    this._weights.push(weight)
    this._payloadMap.set(item, node)

    while (node > 0 && this._weights[parent] > this._weights[node]) {
      this._swap(node, parent)
      node = parent
      parent = Math.ceil(node / 2) - 1
    }
  }

  peek () {
    if (this.isEmpty) {
      throw new EmptyHeapError('Cannot peak an empty heap')
    }

    return {
      item: this._payload[0],
      weight: this._weights[0]
    }
  }

  pop () {
    if (this.isEmpty) {
      throw new EmptyHeapError('Cannot pop an empty heap')
    }

    const min = this.peek()

    if (this._payload.length === 1) {
      this._weights.pop()
      this._payloadMap.delete(this._payload.pop())
    } else {
      this._payloadMap.delete(0)
      this._weights[0] = this._weights.pop()
      this._payload[0] = this._payload.pop()
      this._payloadMap.set(this._payload[0], 0)
      this._siftDown(0)
    }

    return min
  }

  hasItem (item) {
    return this._payloadMap.has(item)
  }

  getItemWeight (item) {
    const index = this._payloadMap.get(item)

    if (index === undefined) {
      throw new NoSuchItemError(`Item ${repr(item)} does not exist in the heap`)
    }

    return this._weights[index]
  }

  updateItemWeight (item, weight) {
    const index = this._payloadMap.get(item)

    if (index === undefined) {
      throw new NoSuchItemError(`Item ${repr(item)} does not exist in the heap`)
    }

    this._swap(0, index)
    this._weights[0] = weight
    this._siftDown(0)
  }

  clone () {
    return new this.constructor(this)
  }
}
