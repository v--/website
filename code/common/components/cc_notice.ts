import { c } from '../rendering/component.js'
import { link } from '../components/link.js'

export function ccNotice() {
  return c('div', { class: 'cc-notice' },
    c('b', { text: 'Notice: ' }),
    c('span', { text: 'Unless specifically noted otherwise, all content on this page is licensed under ' }),
    c(link, { text: 'CC0', link: 'https://creativecommons.org/share-your-work/public-domain/cc0/' }),
    c('span', { text: ', i.e. it is free for modification and redistribution.' })
  )
}
