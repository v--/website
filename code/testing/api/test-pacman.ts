import assert from 'node:assert/strict'
import { after, beforeEach, describe, it } from 'node:test'

import { BaseApiClient } from './base.ts'
import { PACMAN_REPOSITORY_SCHEMA } from '../../common/services.ts'
import { assertTrue } from '../assertion.ts'

describe('/api/pacman', function () {
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

  it('matches the repository schema at the root', async function () {
    const response = await client.get('/api/pacman')
    const payload = await response.json()

    assertTrue(
      PACMAN_REPOSITORY_SCHEMA.matches(payload),
    )
  })

  it('errors out with 404 on subpaths', async function () {
    const response = await client.get('/api/pacman/invalid')

    assert.equal(response.status(), 404)
    assert.deepEqual(
      await response.json(),
      { errorKind: 'http', code: 404 },
    )
  })
})
