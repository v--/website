import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { parseMarkdown } from './parser.ts'
import { MockEnvironment } from '../../testing/unit/mock_environment.ts'
import { renderToString } from '../rendering/static_render.ts'

async function customRenderMarkdown(contents: string): Promise<string> {
  const parsed = parseMarkdown(contents)
  return renderToString(parsed, new MockEnvironment())
}

describe('parseMarkdown function', function () {
  it('parses an empty string', async function () {
    const template = ''
    const expected = '<span></span>'

    assert.equal(await customRenderMarkdown(template), expected)
  })

  it('parses a single whitespace', async function () {
    const template = ' '
    const expected = '<p> </p>'
    assert.equal(await customRenderMarkdown(template), expected)
  })

  it('parses a plain text string', async function () {
    const template = 'test'
    const expected = '<p>test</p>'

    assert.equal(await customRenderMarkdown(template), expected)
  })

  it('parses a URL', async function () {
    const template = '[test](http://test.com)'
    const expected = '<a href="http://test.com">test</a>'

    assert.equal(await customRenderMarkdown(template), expected)
  })
})
