import { ChildProcess, spawn } from 'child_process'

export class Spawn {
  /**
   * @param {string} path
   * @param {string[]} args
   */
  constructor(path, ...args) {
    this.path = path
    this.args = args

    /** @type {ChildProcess=} */
    this.instance = undefined
  }

  start() {
    this.instance = spawn(this.path, this.args, { stdio: 'inherit' })
    this.instance.on('close', () => {
      this.instance = undefined
    })
  }

  kill() {
    if (!this.instance) { return Promise.resolve() }

    return new Promise((resolve, reject) => {
      if (this.instance !== undefined) {
        this.instance.on('exit', resolve)
        this.instance.on('error', reject)
        this.instance.kill('SIGINT')
      }
    })
  }

  async restart() {
    await this.kill()
    this.start()
  }
}
