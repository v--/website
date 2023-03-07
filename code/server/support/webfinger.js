export const WEBFINGER_ALIASES = [
  'acct:ianis@pub.ivasilev.net',
  'mailto:ianis@ivasilev.net',
  'https://pub.ivasilev.net/@ianis',
  'https://pub.ivasilev.net/users/ianis'
]

export const WEBFINGER_LINKS = [
  {
    rel: 'http://webfinger.net/rel/profile-page',
    type: 'text/html',
    href: 'https://ivasilev.net'
  },
  {
    rel: 'http://webfinger.net/rel/avatar',
    type: 'image/jpg',
    href: 'https://ivasilev.net/images/me_irl.jpg'
  },
  {
    rel: 'http://webfinger.net/rel/profile-page',
    type: 'text/html',
    href: 'https://pub.ivasilev.net/@ianis'
  },
  {
    rel: 'self',
    type: 'application/activity+json',
    href: 'https://pub.ivasilev.net/users/ianis'
  }
]
