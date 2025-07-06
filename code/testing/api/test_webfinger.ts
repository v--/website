import assert from 'node:assert/strict'
import { after, beforeEach, describe, it } from 'node:test'

import { BaseApiClient } from './base.ts'
import { WEBFINGER_ALIASES, WEBFINGER_LINKS } from '../../server/constants/webfinger.ts'

describe('/.well-known/webfinger', function () {
  let client: BaseApiClient

  beforeEach(async function () {
    if (client) {
      await client.reset()
    } else {
      client = await BaseApiClient.initialize()
    }
  })

  after(async function () {
    await client?.finalize()
  })

  it('errors out with 400 if no resource is requested', async function () {
    const response = await client.get('/.well-known/webfinger')

    assert.equal(response.status(), 400)
    assert.deepEqual(
      await response.json(),
      { errorKind: 'http', code: 400, details: 'No resource requested.' },
    )
  })

  it('errors out with 404 if an unknown resource is requested', async function () {
    const response = await client.get('/.well-known/webfinger?resource=unknown')

    assert.equal(response.status(), 404)
    assert.deepEqual(
      await response.json(),
      { errorKind: 'http', code: 404, details: 'The requested resource was not found.' },
    )
  })

  it('retrieves the expected data when requested', async function () {
    for (let i = 0; i < WEBFINGER_ALIASES.length; i++) {
      const resource = WEBFINGER_ALIASES[i]

      const response = await client.get(`/.well-known/webfinger?resource=${resource}`)
      const expected = {
        subject: resource,
        aliases: [...WEBFINGER_ALIASES.slice(0, i), ...WEBFINGER_ALIASES.slice(i + 1)],
        links: WEBFINGER_LINKS,
      }

      assert.deepEqual(
        await response.json(),
        expected,
      )
    }
  })
})
