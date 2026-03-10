import { spawn } from 'node:child_process'

import { BuildError } from './errors.ts'

class ExternalCallError extends BuildError {}

class ExternalCallOptions {
  cwd?: string
  env?: Record<string, string>
}

export function callExternalProgram(name: string, args: string[], input: Buffer, options?: ExternalCallOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const inkscape = spawn(name, args, options)
    inkscape.stdin.write(input)
    inkscape.stdin.end()
    const chunks: Buffer[] = []

    inkscape.stdout.on('data', (data: Buffer) => {
      chunks.push(data)
    })

    inkscape.stderr.on('data', (data: Buffer) => {
      reject(new ExternalCallError(data.toString('utf-8')))
    })

    inkscape.on('close', () => {
      resolve(Buffer.concat(chunks))
    })
  })
}

export function optimizePng(input: Buffer): Promise<Buffer> {
  return callExternalProgram('oxipng', ['--stdout', '-'], input)
}

export async function renderSvg(input: Buffer, cwd?: string): Promise<Buffer> {
  return optimizePng(
    // Inkscape has a singleton instance check for development purposes.
    // Using unshare circumvents this check, as well as possible clashes.
    // See https://gitlab.com/inkscape/inkscape/-/work_items/4716#note_1898150983
    await callExternalProgram(
      'unshare', ['inkscape', '--pipe', '--export-type', 'png', '--export-filename', '-'], input,
      { cwd },
    ),
  )
}
