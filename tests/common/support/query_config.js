import { assert } from '../../_common.js'

import { NumericMapping, QueryStringError } from '../../../code/common/support/query_config.js'

describe('NumericMapping', function () {
  describe('.toString()', function () {
    it('stringifies an empty mapping', function () {
      const mapping = new NumericMapping([])
      assert.equal(String(mapping), '')
    })

    it('stringifies a single-element mapping', function () {
      const mapping = new NumericMapping([[0, 1]])
      assert.equal(String(mapping), '0,1')
    })

    it('stringifies a three-element mapping', function () {
      const mapping = new NumericMapping([[0, 1], [1, 2], [2, 3]])
      assert.equal(String(mapping), '0,1;1,2;2,3')
    })
  })

  describe('.fromString()', function () {
    it('parses an empty string', function () {
      const string = ''
      const mapping = NumericMapping.fromString(string)
      assert.equal(String(mapping), string)
    })

    it('parses a single-element string', function () {
      const string = '0,1'
      const mapping = NumericMapping.fromString(string)
      assert.equal(String(mapping), string)
    })

    it('parses a three-element string', function () {
      const string = '0,1;1,2;2,3'
      const mapping = NumericMapping.fromString(string)
      assert.equal(String(mapping), string)
    })

    it('fails to parse gibberish', function () {
      const string = 'eWczRqKCIaAOi'

      assert.throws(function () {
        NumericMapping.fromString(string)
      }, QueryStringError)
    })

    it('fails to parse three-element tuples', function () {
      const string = '0,1,2'

      assert.throws(function () {
        NumericMapping.fromString(string)
      }, QueryStringError)
    })

    it('does not strip trailing semicolons', function () {
      const string = '0,1;'

      assert.throws(function () {
        NumericMapping.fromString(string)
      }, QueryStringError)
    })
  })
})
