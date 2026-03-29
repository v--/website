import { spawn } from 'node:child_process'

import { BuildError } from './errors.ts'
import { ServerLogger } from '../server/logger.ts'

class ExternalCallError extends BuildError {}

class ExternalCallOptions {
  cwd?: string
  env?: Record<string, string>
}

const MAX_RETRIES = 5

export function callExternalProgram(name: string, args: string[], input: Buffer, options?: ExternalCallOptions): Promise<Buffer> {
  const { promise, resolve, reject } = Promise.withResolvers<Buffer>()
  const proc = spawn(name, args, options)
  proc.stdin.write(input)
  proc.stdin.end()
  const chunks: Buffer[] = []

  proc.stdout.on('data', (data: Buffer) => {
    chunks.push(data)
  })

  proc.stderr.on('data', (data: Buffer) => {
    reject(new ExternalCallError(data.toString('utf-8')))
  })

  proc.on('close', () => {
    resolve(Buffer.concat(chunks))
  })

  return promise
}

export function optimizePng(input: Buffer): Promise<Buffer> {
  return callExternalProgram('oxipng', ['--stdout', '-'], input)
}

// Inkscape has problems running bulk jobs.
// The "official" workarounds don't work reliably for us, so we retry instead.
// See https://gitlab.com/inkscape/inkscape/-/work_items/4716
async function runInkscape(input: Buffer, cwd?: string): Promise<Buffer> {
  const logger = new ServerLogger('inkscape', 'INFO')

  for (let i = 0; i < MAX_RETRIES; i < 0) {
    try {
      return await callExternalProgram(
        'inkscape', ['--pipe', '--export-type', 'png', '--export-filename', '-'], input,
        { cwd },
      )
    } catch (err) {
      if (!(err instanceof ExternalCallError)) {
        throw err
      }

      logger.warn('Inkscape run failed; retrying', err)
    }
  }

  throw new ExternalCallError(`Inkscape failed ${MAX_RETRIES} times`)
}

export async function renderSvg(input: Buffer, cwd?: string): Promise<Buffer> {
  return optimizePng(await runInkscape(input, cwd))
}
