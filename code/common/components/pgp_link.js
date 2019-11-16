import { c } from '../rendering/component.js'

import { link } from '../components/link.js'

export const PGP_FINGERPRINT = 'B77A3C8832838F1F80ADFD7E1D0507B417DAB671'
export const PGP_KEY_ID_SHORT = PGP_FINGERPRINT.substr(PGP_FINGERPRINT.length - 8)

export function pgpLink () {
  return c(link, {
    text: '0x' + PGP_KEY_ID_SHORT,
    link: 'http://keys.gnupg.net/pks/lookup?op=vindex&search=0x' + PGP_KEY_ID_SHORT
  })
}
