import { TaskFunction } from 'undertaker'

export function armor(task: TaskFunction): TaskFunction {
  function armored(done: () => void) {
    task(function() {
      done()
    })
  }

  armored.displayName = task.displayName
  return armored
}
