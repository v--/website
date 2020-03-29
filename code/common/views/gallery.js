import { c } from '../rendering/component.js'
import { styles } from '../support/dom_properties.js'
import { map } from '../support/iteration.js'

import { link } from '../components/link.js'
import { icon } from '../components/icon.js'

function getParentGalleryPath (path) {
  if (path.segments.length === 1) {
    return path
  }

  return path.getParentPath()
}

export function gallery ({ data, path }) {
  return c('div', { class: 'page gallery-page' },
    c('div', { class: 'section' },
      c('h1', { class: 'section-title' },
        c(link, { link: getParentGalleryPath(path).underCooked, isInternal: true, title: 'Go to the parent gallery folder' },
          c(icon, { name: 'chevron-up' })
        ),
        c('span', { text: `Index of ${path.underCooked}` })
      ),
      c('p', {
        text: 'A plain-file media gallery. Occasionally used to avoid crippled compression in media hosting services.'
      })
    ),

    c('div', { class: 'gallery' },
      ...map(function (file) {
        return c(
          link,
          {
            class: 'gallery-tile',
            link: '/gallery/' + file.url,
            style: styles({ 'background-image': `url('/gallery/.thumbs/${file.thumbnail.replace("'", "\\'")}')` }),
            isInternal: !file.isFile,
            newTab: file.isFile
          },

          c('div', {
            class: 'gallery-tile-title',
            text: file.name
          }),

          file.isFile && file.name.toLowerCase().endsWith('.mp4') && c(icon, {
            class: 'gallery-tile-arrow',
            name: 'play'
          })
        )
      }, data.files)
    )
  )
}
