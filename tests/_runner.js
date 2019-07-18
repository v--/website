const { glob } = require('glob')

glob('tests/**/*.mjs', { ignore: ['tests/_common.mjs', 'tests/_observable.mjs'] }, async function (err, files) {
  if (err) throw err

  for (const file of files) {
    await import('.' + file.substring('tests'.length))
  }

  run()
})
