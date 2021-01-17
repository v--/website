/** @typedef { import('undertaker').TaskFunction } TaskFunction */

/**
 * @param {TaskFunction} task
 * @returns {TaskFunction}
 */
export function armor(task) {
  /**
   * @param {() => void} done
   */
  function armored(done) {
    task(function() {
      done()
    })
  }

  armored.displayName = task.displayName
  return armored
}
