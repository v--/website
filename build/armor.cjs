module.exports = {
  armor (task) {
    function armored (done) {
      task(function () {
        done()
      })
    }

    armored.displayName = task.displayName
    return armored
  }
}
