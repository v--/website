/* eslint-env browser */

export async function loadBundle (bundle) {
  if (!window.bundles.has(bundle)) {
    await Promise.all([
      new Promise(function (resolve) {
        const script = document.createElement('script')
        script.src = `code/${bundle}.js`
        script.onload = resolve
        document.head.appendChild(script)
      }),

      new Promise(function (resolve) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = `styles/${bundle}.css`
        link.onload = resolve
        document.head.appendChild(link)
      })
    ])
  }

  return window.bundles.get(bundle)
}
