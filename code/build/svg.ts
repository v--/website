import { spawn } from 'node:child_process'

import { BuildError } from './errors.ts'

class InkscapeError extends BuildError {}

export function renderSvg(input: Buffer, cwd?: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const inkscape = spawn('inkscape', ['--pipe', '--export-type', 'png', '--export-filename', '-'], { cwd })
    inkscape.stdin.write(input)
    inkscape.stdin.end()
    const chunks: Buffer[] = []

    inkscape.stdout.on('data', (data: Buffer) => {
      chunks.push(data)
    })

    inkscape.stderr.on('data', (data: Buffer) => {
      reject(new InkscapeError(data.toString('utf-8')))
    })

    inkscape.on('close', () => {
      resolve(Buffer.concat(chunks))
    })
  })
}
