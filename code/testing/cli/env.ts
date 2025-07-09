import { extractCommandLineOption } from './options.ts'
import { type uint32 } from '../../common/types/numbers.ts'

export const TEST_ENVIRONMENTS = ['local', 'prod'] as const
export type TestEnvironment = typeof TEST_ENVIRONMENTS[uint32]

export function getTestEnvironment(argv: string[]): TestEnvironment {
  return extractCommandLineOption('env', TEST_ENVIRONMENTS, argv)
}

export function getBaseEnvironmentUrl(env: TestEnvironment) {
  switch (env) {
    case 'local':
      return 'http://localhost:3000'

    case 'prod':
      return 'https://ivasilev.net'
  }
}
