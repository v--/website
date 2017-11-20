import { c } from '../component'

export default function nojs() {
    return c('div', { class: 'nojs' },
        c('noscript', {
            class: 'content',
            text: 'A modern JavaScript interpreter is required for interactive content and smooth navigation'
        })
    )
}
