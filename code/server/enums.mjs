import { enumerize } from '../common/enums.mjs'

export const HTTPServerState = enumerize(
  'STARTING',
  'RUNNING',
  'STOPPING',
  'INACTIVE'
)
