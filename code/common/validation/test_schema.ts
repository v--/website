import { describe, it } from 'node:test'

import { assertFalse, assertTrue } from '../../testing/assertion.ts'
import { Schema } from '../validation/schema.ts'

describe('Schema namespace', function () {
  describe('for unsigned integers', function () {
    it('allows positive integers', function () {
      assertTrue(
        Schema.uint32.matches(3),
      )
    })

    it('allows zero', function () {
      assertTrue(
        Schema.uint32.matches(0),
      )
    })

    it('forbids negative integers', function () {
      assertFalse(
        Schema.uint32.matches(-3),
      )
    })

    it('forbids fractions', function () {
      assertFalse(
        Schema.uint32.matches(3.3),
      )
    })

    it('forbids strings', function () {
      assertFalse(
        Schema.uint32.matches('3'),
      )
    })
  })

  describe('for a singly-linked list', function () {
    const schema = Schema.recursive(
      Schema.object({
        value: Schema.float64,
        next: Schema.optional(Schema.self),
      }),
    )

    it('allows a list with only one element', function () {
      assertTrue(
        schema.matches({ value: 13 }),
      )
    })

    it('allows a list with two element', function () {
      assertTrue(
        schema.matches({
          value: 13, next: {
            value: 14,
          },
        }),
      )
    })

    it('disallows an empty object', function () {
      assertFalse(
        schema.matches({}),
      )
    })

    it('disallows a list with an invalid value', function () {
      assertFalse(
        schema.matches({
          value: 13, next: {
            value: '14',
          },
        }),
      )
    })
  })
})
