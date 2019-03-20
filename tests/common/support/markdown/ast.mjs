/* globals describe it */

import { assert } from '../../../_common.mjs'

import NodeType from '../../../../code/common/support/markdown/node_type.mjs'

import { parseMarkdown } from '../../../../code/common/support/markdown/parser.mjs'

describe('parseMarkdown()', function () {
  describe('for plain text', function () {
    it('parses single words', function () {
      const string = 'text'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: NodeType.TEXT,
          text: string
        }
      )
    })

    it('parses sentences', function () {
      const string = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: NodeType.TEXT,
          text: string
        }
      )
    })

    it('splits multiline sentences', function () {
      const string = 'lorem\nipsum'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: NodeType.CONTAINER,
          children: [
            {
              type: NodeType.TEXT,
              text: 'lorem'
            },

            {
              type: NodeType.LINE_BREAK
            },

            {
              type: NodeType.TEXT,
              text: 'ipsum'
            }
          ]
        }
      )
    })
  })

  describe('for hyperlinks', function () {
    it('parses standalone hyperlinks', function () {
      const string = '[lorem](https://ipsum.dolor/)'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: NodeType.ANCHOR,
          link: 'https://ipsum.dolor/',
          node: {
            type: NodeType.TEXT,
            text: 'lorem'
          }
        }
      )
    })

    it('allows escaping inside of the description', function () {
      const string = '[lorem\\]](https://ipsum.dolor/)'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: NodeType.ANCHOR,
          link: 'https://ipsum.dolor/',
          node: {
            type: NodeType.TEXT,
            text: 'lorem]'
          }
        }
      )
    })

    it('allows escaping inside of the link', function () {
      const string = '[lorem](https://ipsum.dolor/\\))'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: NodeType.ANCHOR,
          link: 'https://ipsum.dolor/)',
          node: {
            type: NodeType.TEXT,
            text: 'lorem'
          }
        }
      )
    })

    it('treats standalone descriptions as regular text', function () {
      const string = '[lorem]'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: NodeType.TEXT,
          text: string
        }
      )
    })

    it('treats links as regular text', function () {
      const string = '(https://ipsum.dolor/)'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: NodeType.TEXT,
          text: string
        }
      )
    })

    it('treats broken hyperlinks as regular text', function () {
      const string = 'lorem](https://ipsum.dolor/'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: NodeType.TEXT,
          text: string
        }
      )
    })
  })

  describe('for inline code', function () {
    it('recognizes inline code', function () {
      const code = 'while (true);'
      const string = '`' + code + '`'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: NodeType.CODE,
          code
        }
      )
    })

    it('allows escaping inside the code', function () {
      const string = '`\\``'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: NodeType.CODE,
          code: '`'
        }
      )
    })

    it('treats unclosed inline code as text', function () {
      const code = 'while (true);'
      const string = '`' + code
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: NodeType.TEXT,
          text: string
        }
      )
    })

    it('breaks on new lines', function () {
      const code = 'while\n(true);'
      const string = '`' + code + '`'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: NodeType.CONTAINER,
          children: [
            {
              type: NodeType.TEXT,
              text: '`while'
            },

            {
              type: NodeType.LINE_BREAK
            },

            {
              type: NodeType.TEXT,
              text: '(true);`'
            }
          ]
        }
      )
    })
  })

  describe('for code blocks', function () {
    it('recognizes code blocks', function () {
      const code = 'while (true);'
      const string = '```' + code + '```'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: NodeType.CODE_BLOCK,
          code
        }
      )
    })

    it('allows escaping inside the code', function () {
      const string = '```\\````'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: NodeType.CODE_BLOCK,
          code: '`'
        }
      )
    })

    it('treats unclosed inline code as text', function () {
      const code = 'while (true);'
      const string = '```' + code
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: NodeType.TEXT,
          text: string
        }
      )
    })

    it('does not break on new lines', function () {
      const code = 'while\n(true);'
      const string = '```' + code + '```'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: NodeType.CODE_BLOCK,
          code
        }
      )
    })

    it('does not break on a single backtick', function () {
      const code = 'while`(true);'
      const string = '```' + code + '```'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: NodeType.CODE_BLOCK,
          code
        }
      )
    })
  })

  describe('for emphasis', function () {
    it('handles emphasis with asterisks', function () {
      const string = '*text*'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: NodeType.EMPHASIS,
          node: {
            type: NodeType.TEXT,
            text: 'text'
          }
        }
      )
    })

    it('handles emphasis with underscores', function () {
      const string = '_text_'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: NodeType.EMPHASIS,
          node: {
            type: NodeType.TEXT,
            text: 'text'
          }
        }
      )
    })

    it('allows escaping emphasis', function () {
      const string = '*\\**'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: NodeType.EMPHASIS,
          node: {
            type: NodeType.TEXT,
            text: '*'
          }
        }
      )
    })

    it('handles strong emphasis with asterisks', function () {
      const string = '**text**'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: NodeType.STRONG_EMPHASIS,
          node: {
            type: NodeType.TEXT,
            text: 'text'
          }
        }
      )
    })

    it('handles strong emphasis with underscores', function () {
      const string = '__text__'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: NodeType.STRONG_EMPHASIS,
          node: {
            type: NodeType.TEXT,
            text: 'text'
          }
        }
      )
    })

    it('handles strong emphasis with mixed syntax', function () {
      const string = '_*text*_'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: NodeType.STRONG_EMPHASIS,
          node: {
            type: NodeType.TEXT,
            text: 'text'
          }
        }
      )
    })

    it('nests emphasis levels', function () {
      const string = '***text***'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: NodeType.EMPHASIS,
          node: {
            type: NodeType.STRONG_EMPHASIS,
            node: {
              type: NodeType.TEXT,
              text: 'text'
            }
          }
        }
      )
    })
  })

  describe('for headings', function () {
    it('handles h1', function () {
      const string = `#Heading\n`
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: NodeType.HEADING,
          level: 1,
          node: {
            type: NodeType.TEXT,
            text: 'Heading'
          }
        }
      )
    })

    it('strips a single space off h1', function () {
      const string = `# Heading\n`
      assert.equal(
        parseMarkdown(string).node.text,
        'Heading'
      )
    })

    it('strips only one space off h1', function () {
      const string = `#  Heading\n`
      assert.equal(
        parseMarkdown(string).node.text,
        ' Heading'
      )
    })

    it('handles h4', function () {
      const string = `#### Heading\n`
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: NodeType.HEADING,
          level: 4,
          node: {
            type: NodeType.TEXT,
            text: 'Heading'
          }
        }
      )
    })

    it.skip('handles two bullets', function () {
      const string = `
*bullet1
*bullet2
`

      assert.deepEqual(
        parseMarkdown(string),
        {
          type: NodeType.CONTAINER,
          children: [
            {
              type: NodeType.BULLET,
              node: {
                type: NodeType.TEXT,
                text: 'bullet1'
              }
            },
            {
              type: NodeType.BULLET,
              node: {
                type: NodeType.TEXT,
                text: 'bullet2'
              }
            }
          ]
        }
      )
    })
  })
})
