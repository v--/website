/*
 * The Fediverse, mostly Mastodon, has some ways that allow identity verification for authors.
 */

import { type IMetaTag } from './types.ts'

// https://rknight.me/blog/setting-up-mastodon-author-tags/
export const FEDIVERSE_CREATOR_TAG: IMetaTag = {
  name: 'fediverse:creator',
  content: '@ianis@pub.ivasilev.net',
}
