import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { parseMarkdown } from './rich.ts'
import { dedent } from '../../common/support/dedent.ts'

describe('parseMarkdown function', function () {
  describe('supports', function () {
    it('plain text', function () {
      const string = 'lorem'
      const parsed = parseMarkdown(string)

      assert.deepEqual(
        parsed,
        {
          kind: 'document',
          entries: [
            {
              kind: 'paragraph',
              text: string,
            },
          ],
        },
      )
    })

    it('plain text with single quotes', function () {
      const string = "'lorem'"
      const parsed = parseMarkdown(string)

      assert.deepEqual(
        parsed,
        {
          kind: 'document',
          entries: [
            {
              kind: 'paragraph',
              text: string,
            },
          ],
        },
      )
    })

    it('multiline plain text', function () {
      const string = dedent(`\
        Lorem
        Ipsum`,
      )

      const parsed = parseMarkdown(string)

      assert.deepEqual(
        parsed,
        {
          kind: 'document',
          entries: [
            {
              kind: 'paragraph',
              text: string,
            },
          ],
        },
      )
    })

    it('multiline plain text with line breaks', function () {
      const string = dedent(`\
        Lorem

        Ipsum`,
      )

      const parsed = parseMarkdown(string)

      assert.deepEqual(
        parsed,
        {
          kind: 'document',
          entries: [
            {
              kind: 'paragraph',
              text: 'Lorem',
            },
            {
              kind: 'paragraph',
              text: 'Ipsum',
            },
          ],
        },
      )
    })

    it('emphasized text with asterisks', function () {
      const string = '*lorem*'
      const parsed = parseMarkdown(string)

      assert.deepEqual(
        parsed,
        {
          kind: 'document',
          entries: [
            {
              kind: 'paragraph',
              children: [
                { kind: 'emph', text: 'lorem' },
              ],
            },
          ],
        },
      )
    })

    it('emphasized text with underscores', function () {
      const string = '_lorem_'
      const parsed = parseMarkdown(string)

      assert.deepEqual(
        parsed,
        {
          kind: 'document',
          entries: [
            {
              kind: 'paragraph',
              children: [
                { kind: 'emph', text: 'lorem' },
              ],
            },
          ],
        },
      )
    })

    it('strong text with asterisks', function () {
      const string = '**lorem**'
      const parsed = parseMarkdown(string)

      assert.deepEqual(
        parsed,
        {
          kind: 'document',
          entries: [
            {
              kind: 'paragraph',
              children: [
                { kind: 'strong', text: 'lorem' },
              ],
            },
          ],
        },
      )
    })

    it('strong emphasized text with asterisks', function () {
      const string = '***lorem***'
      const parsed = parseMarkdown(string)

      assert.deepEqual(
        parsed,
        {
          kind: 'document',
          entries: [
            {
              kind: 'paragraph',
              children: [
                {
                  kind: 'emph',
                  children: [
                    { kind: 'strong', text: 'lorem' },
                  ],
                },
              ],
            },
          ],
        },
      )
    })

    it('hyperlinks', function () {
      const string = '[Lorem](http://lorem.ipsum)'
      const parsed = parseMarkdown(string)

      assert.deepEqual(
        parsed,
        {
          kind: 'document',
          entries: [
            {
              kind: 'paragraph',
              children: [
                {
                  kind: 'anchor',
                  href: 'http://lorem.ipsum',
                  text: 'Lorem',
                },
              ],
            },
          ],
        },
      )
    })

    it('hyperlinks with strong text', function () {
      const string = '[**Lorem**](http://lorem.ipsum)'
      const parsed = parseMarkdown(string)

      assert.deepEqual(
        parsed,
        {
          kind: 'document',
          entries: [
            {
              kind: 'paragraph',
              children: [
                {
                  kind: 'anchor',
                  href: 'http://lorem.ipsum',
                  children: [
                    {
                      kind: 'strong',
                      text: 'Lorem',
                    },
                  ],
                },
              ],
            },
          ],
        },
      )
    })

    it('hyperlinks with spaces in the link', function () {
      const string = '[Lorem](<http://lorem ipsum>)'
      const parsed = parseMarkdown(string)

      assert.deepEqual(
        parsed,
        {
          kind: 'document',
          entries: [
            {
              kind: 'paragraph',
              children: [
                {
                  kind: 'anchor',
                  href: 'http://lorem ipsum',
                  text: 'Lorem',
                },
              ],
            },
          ],
        },
      )
    })

    it('top-level headings', function () {
      const string = '# Lorem'
      const parsed = parseMarkdown(string)

      assert.deepEqual(
        parsed,
        {
          kind: 'document',
          entries: [
            {
              kind: 'heading',
              level: 1,
              text: 'Lorem',
            },
          ],
        },
      )
    })

    it('third-level headings', function () {
      const string = '### Lorem'
      const parsed = parseMarkdown(string)

      assert.equal(parsed.entries.length, 1)
      assert.deepEqual(
        parsed,
        {
          kind: 'document',
          entries: [
            {
              kind: 'heading',
              level: 3,
              text: 'Lorem',
            },
          ],
        },
      )
    })

    it('third-level headings with emphasized text', function () {
      const string = '### *Lorem*'
      const parsed = parseMarkdown(string)

      assert.equal(parsed.entries.length, 1)

      assert.deepEqual(
        parsed,
        {
          kind: 'document',
          entries: [
            {
              kind: 'heading',
              level: 3,
              children: [
                {
                  kind: 'emph',
                  text: 'Lorem',
                },
              ],
            },
          ],
        },
      )
    })

    it('third-level headings with hyperlinks text', function () {
      const string = '### [Lorem](http://lorem.ipsum)'
      const parsed = parseMarkdown(string)

      assert.equal(parsed.entries.length, 1)

      assert.deepEqual(
        parsed,
        {
          kind: 'document',
          entries: [
            {
              kind: 'heading',
              level: 3,
              children: [
                {
                  kind: 'anchor',
                  href: 'http://lorem.ipsum',
                  text: 'Lorem',
                },
              ],
            },
          ],
        },
      )
    })

    it('tight unordered lists', function () {
      const string = dedent(`\
        * One
        * Two`,
      )

      const parsed = parseMarkdown(string)

      assert.deepEqual(
        parsed,
        {
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
        },
      )
    })

    it('loose unordered lists', function () {
      const string = dedent(`\
        * One
        * Two

          Continued`,
      )

      const parsed = parseMarkdown(string)

      assert.deepEqual(
        parsed,
        {
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
                    {
                      kind: 'paragraph',
                      text: 'Continued',
                    },
                  ],
                },
              ],
            },
          ],
        },
      )
    })

    it('tight ordered lists', function () {
      const string = dedent(`\
        1. One
        2. Two`,
      )

      const parsed = parseMarkdown(string)

      assert.deepEqual(
        parsed,
        {
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
        },
      )
    })

    it('horizontal rules with dashes', function () {
      const string = '---'
      const parsed = parseMarkdown(string)

      assert.deepEqual(
        parsed,
        {
          kind: 'document',
          entries: [
            {
              kind: 'horizontal_rule',
            },
          ],
        },
      )
    })

    it('horizontal rules with underscores', function () {
      const string = '___'
      const parsed = parseMarkdown(string)

      assert.deepEqual(
        parsed,
        {
          kind: 'document',
          entries: [
            {
              kind: 'horizontal_rule',
            },
          ],
        },
      )
    })

    it('code blocks', function () {
      const string = dedent(`\
        \`\`\`
        Lorem
        Ipsum
        \`\`\``,
      )
      const parsed = parseMarkdown(string)

      assert.deepEqual(
        parsed,
        {
          kind: 'document',
          entries: [
            {
              kind: 'code_block',
              text: 'Lorem\nIpsum\n',
            },
          ],
        },
      )
    })

    it('inline code', function () {
      const string = '`lorem`'
      const parsed = parseMarkdown(string)

      assert.deepEqual(
        parsed,
        {
          kind: 'document',
          entries: [
            {
              kind: 'paragraph',
              children: [
                {
                  kind: 'code',
                  text: 'lorem',
                },
              ],
            },
          ],
        },
      )
    })

    it('images', function () {
      const string = '![lorem](ipsum)'
      const parsed = parseMarkdown(string)

      assert.deepEqual(
        parsed,
        {
          kind: 'document',
          entries: [
            {
              kind: 'paragraph',
              children: [
                {
                  kind: 'image',
                  href: 'ipsum',
                  text: 'lorem',
                },
              ],
            },
          ],
        },
      )
    })
  })
})
