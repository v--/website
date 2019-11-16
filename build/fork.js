import childProcess from 'child_process'

export class Fork {
  constructor (path, options = {}) {
    this.path = path
    this.options = options
    this.instance = null
  }

  start () {
    this.instance = childProcess.fork(this.path, this.options)
    this.instance.on('exit', () => {
      this.instance = null
    })
  }

  kill () {
    if (!this.instance) { return Promise.resolve() }

    return new Promise((resolve, reject) => {
      this.instance.on('exit', resolve)
      this.instance.on('error', reject)
      this.instance.kill('SIGINT')
    })
  }

  async restart () {
    await this.kill()
    this.start()
  }
}
