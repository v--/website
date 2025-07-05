import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { CircularBuffer } from './circular_buffer.ts'
import { type uint32 } from '../types/numbers.ts'

describe('CircularBuffer class', function () {
  describe('push method', function () {
    it('works when the buffer is empty', function () {
      const buffer = new CircularBuffer<uint32>(3)
      buffer.push(42)
      assert.equal(buffer.peek(), 42)
    })

    it('works when the buffer is half-empty', function () {
      const buffer = new CircularBuffer<uint32>(3)
      buffer.push(42)
      buffer.push(43)
      assert.equal(buffer.peek(), 43)
    })

    it('works when the buffer is full', function () {
      const buffer = new CircularBuffer<uint32>(3)
      buffer.push(42)
      buffer.push(43)
      buffer.push(44)
      buffer.push(45)
      assert.equal(buffer.peek(), 45)
    })

    it('works when the buffer is overfull', function () {
      const buffer = new CircularBuffer<uint32>(3)
      buffer.push(42)
      buffer.push(43)
      buffer.push(44)
      buffer.push(45)
      buffer.push(46)
      assert.equal(buffer.peek(), 46)
    })
  })

  describe('[Symbol.iterator] method', function () {
    it('works when the buffer is empty', function () {
      const buffer = new CircularBuffer<uint32>(3)
      assert.deepEqual(Array.from(buffer), [])
    })

    it('works when the buffer is full', function () {
      const buffer = new CircularBuffer<uint32>(3)
      buffer.push(42)
      buffer.push(43)
      buffer.push(44)
      assert.deepEqual(Array.from(buffer), [42, 43, 44])
    })

    it('works when the buffer is overfull', function () {
      const buffer = new CircularBuffer<uint32>(3)
      buffer.push(42)
      buffer.push(43)
      buffer.push(44)
      buffer.push(45)
      assert.deepEqual(Array.from(buffer), [43, 44, 45])
    })
  })
})
