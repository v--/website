import assert from 'node:assert/strict'
import { after, beforeEach, describe, it } from 'node:test'

import { BaseApiClient } from './base.ts'
import { TRANSLATION_MAP_SCHEMA } from '../../common/translation.ts'
import { assertTrue } from '../assertion.ts'

describe('/api/translation', function () {
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

  it('serves a correct core English translation', async function () {
    const response = await client.get('/api/translation/core?lang=en')
    const payload = await response.json()

    assertTrue(
      TRANSLATION_MAP_SCHEMA.matches(payload),
    )
  })

  it('errors out with 404 at the root', async function () {
    const response = await client.get('/api/translation')

    assert.equal(response.status(), 404)
    assert.deepEqual(
      await response.json(),
      { errorKind: 'http', code: 404 },
    )
  })

  it('errors out with 404 for an invalid map', async function () {
    const response = await client.get('/api/translation/invalid?lang=en')

    assert.equal(response.status(), 404)
    assert.deepEqual(
      await response.json(),
      { errorKind: 'http', code: 404 },
    )
  })

  it('errors out with 400 for a valid map without a language', async function () {
    const response = await client.get('/api/translation/core')

    assert.equal(response.status(), 400)
    assert.deepEqual(
      await response.json(),
      { errorKind: 'http', code: 400, details: 'Missing language.' },
    )
  })

  it('errors out with 400 for a valid map with an invalid language', async function () {
    const response = await client.get('/api/translation/core?lang=invalid')

    assert.equal(response.status(), 400)
    assert.deepEqual(
      await response.json(),
      { errorKind: 'http', code: 400, details: 'Unexpected language `invalid`.' },
    )
  })

  it('errors out with 403 on server translations', async function () {
    const response = await client.get('/api/translation/server?lang=en')

    assert.equal(response.status(), 403)
    assert.deepEqual(
      await response.json(),
      { errorKind: 'http', code: 403 },
    )
  })
})
