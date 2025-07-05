import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { convertRichToPlain } from './conversion.ts'
import { type IRichTextDocument } from './types.ts'
import { dedent } from '../support/dedent.ts'

describe('convertRichToPlain function', function () {
  describe('correctly converts', function () {
    it('an empty document', function () {
      const rich: IRichTextDocument = {
        kind: 'document',
        entries: [],
      }

      const plain = convertRichToPlain(rich)
      const expected = ''

      assert.equal(plain, expected)
    })

    it('a single paragraph', function () {
      const rich: IRichTextDocument = {
        kind: 'document',
        entries: [
          {
            kind: 'paragraph',
            text: 'lorem',
          },
        ],
      }

      const plain = convertRichToPlain(rich)
      const expected = 'lorem'

      assert.equal(plain, expected)
    })

    it('a single paragraph with strong and emphasized text', function () {
      const rich: IRichTextDocument = {
        kind: 'document',
        entries: [
          {
            kind: 'paragraph',
            children: [
              {
                kind: 'emph',
                text: 'lorem',
              },
              {
                kind: 'strong',
                text: 'ipsum',
              },
              {
                kind: 'text',
                text: '.',
              },
            ],
          },
        ],
      }

      const plain = convertRichToPlain(rich)
      const expected = '*lorem***ipsum**.'

      assert.equal(plain, expected)
    })

    it('multiple paragraphs', function () {
      const rich: IRichTextDocument = {
        kind: 'document',
        entries: [
          {
            kind: 'paragraph',
            text: 'first',
          },
          {
            kind: 'paragraph',
            text: 'second',
          },
        ],
      }

      const plain = convertRichToPlain(rich)
      const expected = 'first\nsecond'

      assert.equal(plain, expected)
    })

    it('a single code block', function () {
      const rich: IRichTextDocument = {
        kind: 'document',
        entries: [
          {
            kind: 'code_block',
            text: 'some\ncode',
          },
        ],
      }

      const plain = convertRichToPlain(rich)
      const expected = '\n  some\n  code\n'

      assert.equal(plain, expected)
    })

    it('a URL not requiring encoding', function () {
      const rich: IRichTextDocument = {
        kind: 'document',
        entries: [
          {
            kind: 'anchor',
            text: 'text',
            href: 'http://lorem.ipsum',
          },
        ],
      }

      const plain = convertRichToPlain(rich)
      const expected = '[text](http://lorem.ipsum)'

      assert.equal(plain, expected)
    })

    it('a URL not requiring encoding', function () {
      const rich: IRichTextDocument = {
        kind: 'document',
        entries: [
          {
            kind: 'anchor',
            text: 'text',
            href: 'http://lorem ipsum',
          },
        ],
      }

      const plain = convertRichToPlain(rich)
      const expected = '[text](<http://lorem ipsum>)'

      assert.equal(plain, expected)
    })

    it('a level 3 heading', function () {
      const rich: IRichTextDocument = {
        kind: 'document',
        entries: [
          {
            kind: 'heading',
            text: 'Lorem',
            level: 3,
          },
        ],
      }

      const plain = convertRichToPlain(rich)
      const expected = '### Lorem\n'

      assert.equal(plain, expected)
    })

    it('a tight unordered list', function () {
      const rich: IRichTextDocument = {
        kind: 'document',
        entries: [
          {
            kind: 'list',
            ordered: false,
            tight: true,
            items: [
              {
                kind: 'list_item',
                children: [
                  {
                    kind: 'paragraph',
                    text: 'One',
                  },
                ],
              },
              {
                kind: 'list_item',
                children: [
                  {
                    kind: 'paragraph',
                    text: 'Two',
                  },
                ],
              },
            ],
          },
        ],
      }

      const plain = convertRichToPlain(rich)
      const expected = dedent(`\
        * One
        * Two
      `)

      assert.equal(plain, expected)
    })

    it('a loose unordered list', function () {
      const rich: IRichTextDocument = {
        kind: 'document',
        entries: [
          {
            kind: 'list',
            ordered: false,
            tight: false,
            items: [
              {
                kind: 'list_item',
                children: [
                  {
                    kind: 'paragraph',
                    text: 'One',
                  },
                ],
              },
              {
                kind: 'list_item',
                children: [
                  {
                    kind: 'paragraph',
                    text: 'Two',
                  },
                ],
              },
            ],
          },
        ],
      }

      const plain = convertRichToPlain(rich)
      const expected = dedent(`\
        * One

        * Two
      `)

      assert.equal(plain, expected)
    })

    it('a tight ordered list', function () {
      const rich: IRichTextDocument = {
        kind: 'document',
        entries: [
          {
            kind: 'list',
            ordered: true,
            tight: true,
            items: [
              {
                kind: 'list_item',
                children: [
                  {
                    kind: 'paragraph',
                    text: 'One',
                  },
                ],
              },
              {
                kind: 'list_item',
                children: [
                  {
                    kind: 'paragraph',
                    text: 'Two',
                  },
                ],
              },
            ],
          },
        ],
      }

      const plain = convertRichToPlain(rich)
      const expected = dedent(`\
        1. One
        2. Two
      `)

      assert.equal(plain, expected)
    })
  })

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  describe.only('mathml', function () {
    it('with only one identifier', function () {
      const rich: IRichTextDocument = {
        kind: 'document',
        entries: [
          {
            kind: 'mathml',
            tag: 'math',
            children: [
              {
                kind: 'mathml',
                tag: 'mi',
                text: 'f',
              },
            ],
          },
        ],
      }

      const plain = convertRichToPlain(rich)
      const expected = '$f$'

      assert.equal(plain, expected)
    })

    it('with only one identifier in block display mode', function () {
      const rich: IRichTextDocument = {
        kind: 'document',
        entries: [
          {
            kind: 'mathml',
            tag: 'math',
            attributes: { display: 'block' },
            children: [
              {
                kind: 'mathml',
                tag: 'mi',
                text: 'f',
              },
            ],
          },
        ],
      }

      const plain = convertRichToPlain(rich)
      const expected = dedent(`\

        $$
          f
        $$
      `)

      assert.equal(plain, expected)
    })

    it('with only one number', function () {
      const rich: IRichTextDocument = {
        kind: 'document',
        entries: [
          {
            kind: 'mathml',
            tag: 'math',
            children: [
              {
                kind: 'mathml',
                tag: 'mn',
                text: '3',
              },
            ],
          },
        ],
      }

      const plain = convertRichToPlain(rich)
      const expected = '$3$'

      assert.equal(plain, expected)
    })

    it('with only one operator', function () {
      const rich: IRichTextDocument = {
        kind: 'document',
        entries: [
          {
            kind: 'mathml',
            tag: 'math',
            children: [
              {
                kind: 'mathml',
                tag: 'mo',
                text: '+',
              },
            ],
          },
        ],
      }

      const plain = convertRichToPlain(rich)
      const expected = '$+$'

      assert.equal(plain, expected)
    })

    it('with only one operator followed by an identifier', function () {
      const rich: IRichTextDocument = {
        kind: 'document',
        entries: [
          {
            kind: 'mathml',
            tag: 'math',
            children: [
              {
                kind: 'mathml',
                tag: 'mo',
                text: '+',
              },
              {
                kind: 'mathml',
                tag: 'mi',
                text: 'f',
              },
            ],
          },
        ],
      }

      const plain = convertRichToPlain(rich)
      const expected = '$+f$'

      assert.equal(plain, expected)
    })

    it('with two identifiers delimiter by a operator', function () {
      const rich: IRichTextDocument = {
        kind: 'document',
        entries: [
          {
            kind: 'mathml',
            tag: 'math',
            children: [
              {
                kind: 'mathml',
                tag: 'mi',
                text: 'f',
              },
              {
                kind: 'mathml',
                tag: 'mo',
                text: '+',
              },
              {
                kind: 'mathml',
                tag: 'mi',
                text: 'g',
              },
            ],
          },
        ],
      }

      const plain = convertRichToPlain(rich)
      const expected = '$f + g$'

      assert.equal(plain, expected)
    })

    it('adds spacing after a separator operator', function () {
      const rich: IRichTextDocument = {
        kind: 'document',
        entries: [
          {
            kind: 'mathml',
            tag: 'math',
            children: [
              {
                kind: 'mathml',
                tag: 'mi',
                text: 'f',
              },
              {
                kind: 'mathml',
                tag: 'mo',
                text: ',',
                attributes: { separator: 'true' },
              },
              {
                kind: 'mathml',
                tag: 'mi',
                text: 'g',
              },
            ],
          },
        ],
      }

      const plain = convertRichToPlain(rich)
      const expected = '$f, g$'

      assert.equal(plain, expected)
    })

    it('leaves "form" operators as-is', function () {
      const rich: IRichTextDocument = {
        kind: 'document',
        entries: [
          {
            kind: 'mathml',
            tag: 'math',
            children: [
              {
                kind: 'mathml',
                tag: 'mi',
                text: 'f',
              },
              {
                kind: 'mathml',
                tag: 'mo',
                text: '(',
                attributes: { form: 'prefix' },
              },
              {
                kind: 'mathml',
                tag: 'mi',
                text: 'x',
              },
              {
                kind: 'mathml',
                tag: 'mo',
                text: ')',
                attributes: { form: 'postfix' },
              },
            ],
          },
        ],
      }

      const plain = convertRichToPlain(rich)
      const expected = '$f(x)$'

      assert.equal(plain, expected)
    })
  })
})
