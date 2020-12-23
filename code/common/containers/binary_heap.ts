import { CoolError } from '../../common/errors.js'
import { swap } from '../../common/support/iteration.js'
import { repr } from '../../common/support/strings.js'
import { NonStrictMap } from '../types/non_strict_map.js'
import { float64, uint32 } from '../types/numeric.js'

export class BinaryHeapError extends CoolError {}
export class EmptyHeapError extends BinaryHeapError {}
export class NoSuchItemError extends BinaryHeapError {}

export interface BinaryHeapParams<T> {
  payload?: T[],
  weights?: float64[],
  payloadMap?: NonStrictMap<T, uint32>
}

export interface BinaryHeap<T> extends Required<BinaryHeapParams<T>> {}
export class BinaryHeap<T> {
  constructor({ payload = [], weights = [], payloadMap = new Map() }: BinaryHeapParams<T> = {}) {
    this.payload = payload
    this.weights = weights
    this.payloadMap = payloadMap
  }

  get isEmpty() {
    return this.payload.length === 0
  }

  _swap(i: uint32, j: uint32) {
    swap(this.payload, i, j)
    swap(this.weights, i, j)
    this.payloadMap.set(this.payload[i], i)
    this.payloadMap.set(this.payload[j], j)
  }

  _siftDown(start: uint32) {
    let node = start
    let leftChild = 2 * start + 1
    let rightChild = 2 * start + 2

    while (leftChild < this.payload.length) {
      let candidate = node

      if (this.weights[leftChild] < this.weights[node]) {
        candidate = leftChild
      }

      if (rightChild < this.payload.length && this.weights[rightChild] < this.weights[candidate]) {
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

  insert(item: T, weight?: float64) {
    let node = this.payload.length
    let parent = Math.ceil(node / 2) - 1

    this.payload.push(item)

    if (weight === undefined) {
      if (typeof item === 'number') {
        this.weights.push(item)
      } else {
        throw new BinaryHeapError('No weight provided and the item cannot be used as a weight')
      }
    } else {
      this.weights.push(weight)
    }

    this.payloadMap.set(item, node)

    while (node > 0 && this.weights[parent] > this.weights[node]) {
      this._swap(node, parent)
      node = parent
      parent = Math.ceil(node / 2) - 1
    }
  }

  peek() {
    if (this.isEmpty) {
      throw new EmptyHeapError('Cannot peak an empty heap')
    }

    return {
      item: this.payload[0],
      weight: this.weights[0]
    }
  }

  pop() {
    if (this.isEmpty) {
      throw new EmptyHeapError('Cannot pop an empty heap')
    }

    const min = this.peek()

    if (this.payload.length === 1) {
      this.payloadMap.delete(this.payload.pop()!)
      this.weights.pop()
    } else {
      this.payloadMap.delete(this.payload[0])
      this.weights[0] = this.weights.pop()!
      this.payload[0] = this.payload.pop()!
      this.payloadMap.set(this.payload[0], 0)
      this._siftDown(0)
    }

    return min
  }

  hasItem(item: T) {
    return this.payloadMap.has(item)
  }

  getItemWeight(item: T) {
    const index = this.payloadMap.get(item)

    if (index === undefined) {
      throw new NoSuchItemError(`Item ${repr(item)} does not exist in the heap`)
    }

    return this.weights[index]
  }

  updateItemWeight(item: T, weight: float64) {
    const index = this.payloadMap.get(item)

    if (index === undefined) {
      throw new NoSuchItemError(`Item ${repr(item)} does not exist in the heap`)
    }

    this._swap(0, index)
    this.weights[0] = weight
    this._siftDown(0)
  }

  clone() {
    return new BinaryHeap(this)
  }
}
