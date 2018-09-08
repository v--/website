import path from 'path'
import * as fs from '../code/server/support/fs'

export default function rmdir (dir) {
  return fs.readdir(dir, 'utf8').then(
    function (files) {
      return Promise.all(
        files.map(function (relative) {
          const file = path.join(dir, relative)

          return fs.unlink(file).catch(function (err) {
            if (err.code === 'EISDIR') {
              return rmdir(file)
            } else {
              throw err
            }
          })
        })
      ).then(function () {
        return fs.rmdir(dir)
      })
    },

    function (err) {
      // Ignore missing files
      if (err.code !== 'ENOENT' && err.code !== 'ENOTDIR') {
        throw err
      }
    }
  )
}
