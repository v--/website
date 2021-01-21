import { describe, it, assert } from '../../../_common.js'

import { parseMarkdown } from '../../../../code/common/support/markdown/parser.js'

describe('parseMarkdown()', function() {
  describe('for plain text', function() {
    it('parses single words', function() {
      const string = 'text'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: 'text',
          text: string
        }
      )
    })

    it('parses sentences', function() {
      const string = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: 'text',
          text: string
        }
      )
    })

    it('splits multiline sentences', function() {
      const string = 'lorem\nipsum'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: 'container',
          children: [
            {
              type: 'text',
              text: 'lorem'
            },

            {
              type: 'lineBreak'
            },

            {
              type: 'text',
              text: 'ipsum'
            }
          ]
        }
      )
    })
  })

  describe('for hyperlinks', function() {
    it('parses standalone hyperlinks', function() {
      const string = '[lorem](https://ipsum.dolor/)'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: 'anchor',
          link: 'https://ipsum.dolor/',
          node: {
            type: 'text',
            text: 'lorem'
          }
        }
      )
    })

    it('allows escaping inside of the description', function() {
      const string = '[lorem\\]](https://ipsum.dolor/)'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: 'anchor',
          link: 'https://ipsum.dolor/',
          node: {
            type: 'text',
            text: 'lorem]'
          }
        }
      )
    })

    it('allows escaping inside of the link', function() {
      const string = '[lorem](https://ipsum.dolor/\\))'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: 'anchor',
          link: 'https://ipsum.dolor/)',
          node: {
            type: 'text',
            text: 'lorem'
          }
        }
      )
    })

    it('treats standalone descriptions as regular text', function() {
      const string = '[lorem]'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: 'text',
          text: string
        }
      )
    })

    it('treats links as regular text', function() {
      const string = '(https://ipsum.dolor/)'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: 'text',
          text: string
        }
      )
    })

    it('treats broken hyperlinks as regular text', function() {
      const string = 'lorem](https://ipsum.dolor/'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: 'text',
          text: string
        }
      )
    })
  })

  describe('for inline code', function() {
    it('recognizes inline code', function() {
      const code = 'while (true);'
      const string = '`' + code + '`'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: 'code',
          code
        }
      )
    })

    it('allows escaping inside the code', function() {
      const string = '`\\``'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: 'code',
          code: '`'
        }
      )
    })

    it('treats unclosed inline code as text', function() {
      const code = 'while (true);'
      const string = '`' + code
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: 'text',
          text: string
        }
      )
    })

    it('breaks on new lines', function() {
      const code = 'while\n(true);'
      const string = '`' + code + '`'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: 'container',
          children: [
            {
              type: 'text',
              text: '`while'
            },

            {
              type: 'lineBreak'
            },

            {
              type: 'text',
              text: '(true);`'
            }
          ]
        }
      )
    })
  })

  describe('for code blocks', function() {
    it('recognizes code blocks', function() {
      const code = 'while (true);'
      const string = '```' + code + '```'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: 'codeBlock',
          code
        }
      )
    })

    it('allows escaping inside the code', function() {
      const string = '```\\````'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: 'codeBlock',
          code: '`'
        }
      )
    })

    it('treats unclosed inline code as text', function() {
      const code = 'while (true);'
      const string = '```' + code
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: 'text',
          text: string
        }
      )
    })

    it('does not break on new lines', function() {
      const code = 'while\n(true);'
      const string = '```' + code + '```'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: 'codeBlock',
          code
        }
      )
    })

    it('does not break on a single backtick', function() {
      const code = 'while`(true);'
      const string = '```' + code + '```'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: 'codeBlock',
          code
        }
      )
    })
  })

  describe('for emphasis', function() {
    it('handles emphasis', function() {
      const string = '*text*'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: 'emphasis',
          node: {
            type: 'text',
            text: 'text'
          }
        }
      )
    })

    it('allows escaping emphasis', function() {
      const string = '*\\**'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: 'emphasis',
          node: {
            type: 'text',
            text: '*'
          }
        }
      )
    })

    it('handles strong emphasis', function() {
      const string = '**text**'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: 'strongEmphasis',
          node: {
            type: 'text',
            text: 'text'
          }
        }
      )
    })

    it('handles very strong emphasis', function() {
      const string = '***text***'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: 'veryStrongEmphasis',
          node: {
            type: 'text',
            text: 'text'
          }
        }
      )
    })
  })

  describe('for headings', function() {
    it('handles h1', function() {
      const string = '#Heading\n'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: 'heading',
          level: 1,
          node: {
            type: 'text',
            text: 'Heading'
          }
        }
      )
    })

    it('treats hash signs as text if they are not at the beginning of the line', function() {
      const string = ' #Heading\n'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: 'container',
          children: [
            {
              type: 'text',
              text: ' #Heading'
            },

            {
              type: 'lineBreak'
            }
          ]
        }
      )
    })

    it('parses headings if they are not on the first line', function() {
      const string = '\n# Heading\n'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: 'container',
          children: [
            {
              type: 'lineBreak'
            },

            {
              type: 'heading',
              level: 1,
              node: {
                type: 'text',
                text: 'Heading'
              }
            }
          ]
        }
      )
    })

    it('strips a single space off h1', function() {
      const string = '# Heading\n'
      const root = /** @type {TMarkdown.IHeadingNode} */ (parseMarkdown(string))

      assert.equal(
        (/** @type {TMarkdown.ITextNode} */ (root.node)).text,
        'Heading'
      )
    })

    it('strips only one space off h1', function() {
      const string = '#  Heading\n'
      const root = /** @type {TMarkdown.IHeadingNode} */ (parseMarkdown(string))

      assert.equal(
        (/** @type {TMarkdown.ITextNode} */ (root.node)).text,
        ' Heading'
      )
    })

    it('handles h4', function() {
      const string = '#### Heading\n'
      assert.deepEqual(
        parseMarkdown(string),
        {
          type: 'heading',
          level: 4,
          node: {
            type: 'text',
            text: 'Heading'
          }
        }
      )
    })
  })

  describe('for bullet lists', function() {
    it('handles one bullet', function() {
      const string = `
*bullet
`

      assert.deepEqual(
        parseMarkdown(string),
        {
          type: 'bulletList',
          ordered: false,
          bullets: [
            {
              type: 'bulletUnordered',
              level: 1,
              node: {
                type: 'text',
                text: 'bullet'
              }
            }
          ]
        }
      )
    })

    it('strips a single space after the asterisk', function() {
      const string = `
* bullet
`
      const root = /** @type {TMarkdown.IBulletListNode} */ (parseMarkdown(string))
      const bullet = /** @type {TMarkdown.IOrderedBulletNode} */ (root.bullets[0])

      assert.equal(
        (/** @type {TMarkdown.ITextNode} */ (bullet.node)).text,
        'bullet'
      )
    })

    it('strips only one space after the asterisk', function() {
      const string = `
*  bullet
`

      const root = /** @type {TMarkdown.IBulletListNode} */ (parseMarkdown(string))
      const bullet = /** @type {TMarkdown.IOrderedBulletNode} */ (root.bullets[0])

      assert.equal(
        (/** @type {TMarkdown.ITextNode} */ (bullet.node)).text,
        ' bullet'
      )
    })

    it('handles ordered lists', function() {
      const string = `
1) bullet
`

      assert.deepEqual(
        parseMarkdown(string),
        {
          type: 'bulletList',
          ordered: true,
          bullets: [
            {
              type: 'bulletOrdered',
              level: 1,
              order: 1,
              node: {
                type: 'text',
                text: 'bullet'
              }
            }
          ]
        }
      )
    })

    it('handles custom orders in ordered lists', function() {
      const string = `
13) bullet1
4) bullet2
`

      assert.deepEqual(
        parseMarkdown(string),
        {
          type: 'bulletList',
          ordered: true,
          bullets: [
            {
              type: 'bulletOrdered',
              level: 1,
              order: 13,
              node: {
                type: 'text',
                text: 'bullet1'
              }
            },

            {
              type: 'bulletOrdered',
              level: 1,
              order: 4,
              node: {
                type: 'text',
                text: 'bullet2'
              }
            }
          ]
        }
      )
    })

    it('handles bullet lists that do not start on the first line', function() {
      const string = `text
* bullet
`

      assert.deepEqual(
        parseMarkdown(string),
        {
          type: 'container',
          children: [
            {
              type: 'text',
              text: 'text'
            },

            {
              type: 'bulletList',
              ordered: false,
              bullets: [
                {
                  type: 'bulletUnordered',
                  level: 1,
                  node: {
                    type: 'text',
                    text: 'bullet'
                  }
                }
              ]
            }
          ]
        }
      )
    })

    it('handles two unordered bullets', function() {
      const string = `
* bullet1
* bullet2
`

      assert.deepEqual(
        parseMarkdown(string),
        {
          type: 'bulletList',
          ordered: false,
          bullets: [
            {
              type: 'bulletUnordered',
              level: 1,
              node: {
                type: 'text',
                text: 'bullet1'
              }
            },

            {
              type: 'bulletUnordered',
              level: 1,
              node: {
                type: 'text',
                text: 'bullet2'
              }
            }
          ]
        }
      )
    })

    it('handles two nested bullets', function() {
      const string = `
* bullet1
 * bullet2
`

      assert.deepEqual(
        parseMarkdown(string),
        {
          type: 'bulletList',
          ordered: false,
          bullets: [
            {
              type: 'bulletUnordered',
              level: 1,
              node: {
                type: 'text',
                text: 'bullet1'
              }
            },

            {
              type: 'bulletList',
              ordered: false,
              bullets: [
                {
                  type: 'bulletUnordered',
                  level: 2,
                  node: {
                    type: 'text',
                    text: 'bullet2'
                  }
                }
              ]
            }
          ]
        }
      )
    })

    it('handles two runs of nested bullets with non-identical indentation', function() {
      const string = `
* bullet1
 * bullet2
* bullet3
 * bullet4
`

      assert.deepEqual(
        parseMarkdown(string),
        {
          type: 'bulletList',
          ordered: false,
          bullets: [
            {
              type: 'bulletUnordered',
              level: 1,
              node: {
                type: 'text',
                text: 'bullet1'
              }
            },

            {
              type: 'bulletList',
              ordered: false,
              bullets: [
                {
                  type: 'bulletUnordered',
                  level: 2,
                  node: {
                    type: 'text',
                    text: 'bullet2'
                  }
                }
              ]
            },

            {
              type: 'bulletUnordered',
              level: 1,
              node: {
                type: 'text',
                text: 'bullet3'
              }
            },

            {
              type: 'bulletList',
              ordered: false,
              bullets: [
                {
                  type: 'bulletUnordered',
                  level: 2,
                  node: {
                    type: 'text',
                    text: 'bullet4'
                  }
                }
              ]
            }
          ]
        }
      )
    })

    it('handles non-local rollbacks from deeply nested bullets', function() {
      const string = `
* bullet1
 * bullet2
  * bullet3
* bullet4
`

      assert.deepEqual(
        parseMarkdown(string),
        {
          type: 'bulletList',
          ordered: false,
          bullets: [
            {
              type: 'bulletUnordered',
              level: 1,
              node: {
                type: 'text',
                text: 'bullet1'
              }
            },

            {
              type: 'bulletList',
              ordered: false,
              bullets: [
                {
                  type: 'bulletUnordered',
                  level: 2,
                  node: {
                    type: 'text',
                    text: 'bullet2'
                  }
                },

                {
                  type: 'bulletList',
                  ordered: false,
                  bullets: [
                    {
                      type: 'bulletUnordered',
                      level: 3,
                      node: {
                        type: 'text',
                        text: 'bullet3'
                      }
                    }
                  ]
                }
              ]
            },

            {
              type: 'bulletUnordered',
              level: 1,
              node: {
                type: 'text',
                text: 'bullet4'
              }
            }
          ]
        }
      )
    })
  })

  describe('for mixed input', function() {
    it('handles example daily report documents', function() {
      const string = `# Title

## Action items

1) Action item 1
2) Action item 2 (__important__)

## Status

* Item 1
* Item 2 with [*hyperlink*](https://ipsum.dolor)
* Item 3 with a \`\`\`code
block\`\`\`
* Item 4
`

      assert.deepEqual(
        parseMarkdown(string),
        {
          type: 'container',
          children: [
            {
              type: 'heading',
              level: 1,
              node: {
                text: 'Title',
                type: 'text'
              }
            },

            {
              type: 'lineBreak'
            },

            {
              type: 'heading',
              level: 2,
              node: {
                text: 'Action items',
                type: 'text'
              }
            },

            {
              type: 'bulletList',
              ordered: true,
              bullets: [
                {
                  type: 'bulletOrdered',
                  order: 1,
                  level: 1,
                  node: {
                    type: 'text',
                    text: 'Action item 1'
                  }
                },

                {
                  type: 'bulletOrdered',
                  order: 2,
                  level: 1,
                  node: {
                    type: 'container',
                    children: [
                      {
                        type: 'text',
                        text: 'Action item 2 ('
                      },
                      {
                        type: 'strongEmphasis',
                        node: {
                          type: 'text',
                          text: 'important'
                        }
                      },
                      {
                        type: 'text',
                        text: ')'
                      }
                    ]
                  }
                }
              ]
            },

            {
              type: 'lineBreak'
            },

            {
              type: 'heading',
              level: 2,
              node: {
                type: 'text',
                text: 'Status'
              }
            },

            {
              type: 'bulletList',
              ordered: false,
              bullets: [
                {
                  type: 'bulletUnordered',
                  level: 1,
                  node: {
                    type: 'text',
                    text: 'Item 1'
                  }
                },

                {
                  type: 'bulletUnordered',
                  level: 1,
                  node: {
                    type: 'container',
                    children: [
                      {
                        type: 'text',
                        text: 'Item 2 with '
                      },

                      {
                        type: 'anchor',
                        link: 'https://ipsum.dolor',
                        node: {
                          type: 'emphasis',
                          node: {
                            type: 'text',
                            text: 'hyperlink'
                          }
                        }
                      }
                    ]
                  }
                },

                {
                  type: 'bulletUnordered',
                  level: 1,
                  node: {
                    type: 'container',
                    children: [
                      {
                        type: 'text',
                        text: 'Item 3 with a '
                      },

                      {
                        type: 'codeBlock',
                        code: 'code\nblock'
                      }
                    ]
                  }
                },

                {
                  type: 'bulletUnordered',
                  level: 1,
                  node: {
                    type: 'text',
                    text: 'Item 4'
                  }
                }
              ]
            }
          ]
        }
      )
    })
  })
})
