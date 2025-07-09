import { CoolError } from '../../common/errors.ts'
import { includes } from '../../common/support/iteration.ts'

export class TestingCliError extends CoolError {}

function* iterCandidateOptionValues(optName: string, argv: string[]): Generator<string> {
  const prefix = `--${optName}`
  let expectValue = false

  for (const arg of argv) {
    if (expectValue) {
      yield arg
    } else if (arg.startsWith(prefix)) {
      if (arg.length === prefix.length) {
        expectValue = true
      } else if (arg[prefix.length] === '=') {
        yield arg.slice(prefix.length + 1)
      }
    }
  }
}

export function extractCommandLineOption<T extends string>(optName: string, supportedValues: readonly T[], argv: string[]): T {
  const candidates = Array.from(iterCandidateOptionValues(optName, argv))

  if (candidates.length === 0) {
    throw new TestingCliError('No values for CLI option', { optName, supportedValues })
  }

  if (candidates.length > 1) {
    throw new TestingCliError('Multiple values for CLI option', { optName, supportedValues, candidates })
  }

  const optValue = candidates[0]

  if (!includes(supportedValues, optValue)) {
    throw new TestingCliError('Unrecognized value for CLI option', { optName, optValue, supportedValues })
  }

  return optValue
}
