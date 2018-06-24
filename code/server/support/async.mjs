export function promisory (func) {
  return function (...args) {
    return new Promise(function (resolve, reject) {
      func(...args, function (err, value) {
        if (err) {
          reject(err)
        } else {
          resolve(value)
        }
      })
    })
  }
}
