import { ChildProcess, spawn } from 'child_process'

export class Spawn {
  private instance?: ChildProcess
  args: string[]

  constructor(
    public path: string,
    ...args: string[]
  ) {
    this.args = args
  }

  start(): void {
    this.instance = spawn(this.path, this.args, { stdio: 'inherit' })
    this.instance.on('close', () => {
      this.instance = undefined
    })
  }

  kill(): Promise<void> {
    if (!this.instance) { return Promise.resolve() }

    return new Promise((resolve, reject) => {
      if (this.instance !== undefined) {
        this.instance.on('exit', resolve)
        this.instance.on('error', reject)
        this.instance.kill('SIGINT')
      }
    })
  }

  async restart(): Promise<void> {
    await this.kill()
    this.start()
  }
}
