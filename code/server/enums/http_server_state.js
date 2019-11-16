import { enumerate } from '../../common/support/enumerate.js'

export const HTTPServerState = enumerate(
  'STARTING',
  'RUNNING',
  'STOPPING',
  'INACTIVE'
)
