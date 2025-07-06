/*
 * WebFinger is, quoting https://webfinger.net/
 * > A way to attach information to an email address, or other online resource.
 *
 * It requires serving JSON metainformation at a dedicated API endpoint
 */

import { type IMetaLink } from './types.ts'

export const WEBFINGER_ALIASES = [
  'acct:ianis@pub.ivasilev.net',
  'mailto:ianis@ivasilev.net',
  'https://pub.ivasilev.net/@ianis',
  'https://pub.ivasilev.net/users/ianis',
]

export const WEBFINGER_LINKS: IMetaLink[] = [
  {
    rel: 'http://webfinger.net/rel/profile-page',
    type: 'text/html',
    href: 'https://ivasilev.net',
  },
  {
    rel: 'http://webfinger.net/rel/avatar',
    type: 'image/jpg',
    href: 'https://ivasilev.net/images/photo.jpg',
  },
  {
    rel: 'http://webfinger.net/rel/profile-page',
    type: 'text/html',
    href: 'https://pub.ivasilev.net/@ianis',
  },
  {
    rel: 'self',
    type: 'application/activity+json',
    href: 'https://pub.ivasilev.net/users/ianis',
  },
]
