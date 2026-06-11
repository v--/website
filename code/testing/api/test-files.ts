import assert from 'node:assert/strict'
import { after, beforeEach, describe, it } from 'node:test'

import { BaseApiClient } from './base.ts'
import { DIRECTORY_SCHEMA } from '../../common/services.ts'
import { assertTrue } from '../assertion.ts'

describe('/api/files', function () {
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

  it('matches the directory schema at the root', async function () {
    const response = await client.get('/api/files')
    const payload = await response.json()

    assertTrue(
      DIRECTORY_SCHEMA.matches(payload),
    )
  })

  it('matches the directory schema on an existing directory', async function () {
    const response = await client.get('/api/files/sub')
    const payload = await response.json()

    assertTrue(
      DIRECTORY_SCHEMA.matches(payload),
    )
  })

  it('errors out with 404 on an invalid directory', async function () {
    const response = await client.get('/api/files/invalid')

    assert.equal(response.status(), 404)
    assert.deepEqual(
      await response.json(),
      { errorKind: 'http', code: 404 },
    )
  })

  it('errors out with 403 on an existing hidden directory', async function () {
    const response = await client.get('/api/files/.valid')

    assert.equal(response.status(), 403)
    assert.deepEqual(
      await response.json(),
      { errorKind: 'http', code: 403 },
    )
  })

  it('errors out with 403 on a hidden subdirectory of a visible directory', async function () {
    const response = await client.get('/api/files/.valid/sub')

    assert.equal(response.status(), 403)
    assert.deepEqual(
      await response.json(),
      { errorKind: 'http', code: 403 },
    )
  })

  it('errors out with 403 on a visible subdirectory of a hidden directory', async function () {
    const response = await client.get('/api/files/.valid/sub')

    assert.equal(response.status(), 403)
    assert.deepEqual(
      await response.json(),
      { errorKind: 'http', code: 403 },
    )
  })

  it('errors out with 403 on a non-existing hidden directory', async function () {
    const response = await client.get('/api/files/.invalid')

    assert.equal(response.status(), 403)
    assert.deepEqual(
      await response.json(),
      { errorKind: 'http', code: 403 },
    )
  })
})
