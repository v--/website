import { rich } from '../components/rich.ts'
import { OPENPGP_KEYSERVER_URL, OPENPGP_KEY_ID_SHORT } from '../constants/url.ts'
import { WebsiteEnvironment } from '../environment.ts'
import { createComponent as c } from '../rendering/component.ts'
import { type IPacmanRepository, type PacmanPackageArch } from '../services/pacman.ts'
import { type IPacmanPackage } from '../services.ts'
import { groupBy } from '../support/iteration.ts'
import { type IWebsitePageState } from '../types/page.ts'

export function pacmanPage({ pageData }: IWebsitePageState<IPacmanRepository>, env: WebsiteEnvironment) {
  const byArch = groupBy(pageData.packages, pkg => pkg.arch)
  const _ = env.gettext.bindToBundle('pacman')

  return c.html('main', { class: 'pacman-page' },
    c.html('section', undefined,
      c.html('h1', { text: _('heading.main') }),

      c.factory(rich, {
        mode: 'paragraph',
        doc: _.rich$('text'),
      }),

      c.html('pre', undefined,
        c.html('code', {
          text: '[ivasilev]\nServer = https://ivasilev.net/pacman/$arch',
        }),
      ),

      c.factory(rich, {
        mode: 'paragraph',
        rootCssClass: 'notice notice-info',
        doc: _.rich$('notice.variables'),
      }),
      c.factory(rich, {
        mode: 'paragraph',
        rootCssClass: 'notice notice-success',
        doc: _.rich$(
          {
            key: 'notice.openpgp',
            context: { keyName: OPENPGP_KEY_ID_SHORT, keyUrl: OPENPGP_KEYSERVER_URL },
          },
        ),
      }),
    ),

    c.html('section', undefined,
      c.html('h1', { text: _('heading.packages') }),
      // TODO: Remove Array.from once Iterator.prototype.map() proliferates
      ...Array.from(byArch.entries()).map(([arch, pkgs]) => c.factory(packages, { arch, pkgs })),
    ),
  )
}

function* iterPackagesComponents(pkgs: IPacmanPackage[], env: WebsiteEnvironment) {
  const _ = env.gettext.bindToBundle('pacman')

  for (const pkg of pkgs) {
    yield c.html('dt', { text: _({ key: 'version', context: pkg }) })
    yield c.html('dd', { text: pkg.description })
  }
}

interface IPackagesState {
  arch: PacmanPackageArch
  pkgs: IPacmanPackage[]
}

function packages({ arch, pkgs }: IPackagesState, env: WebsiteEnvironment) {
  return c.html('div', { class: 'packages' },
    c.html('h2', { text: arch }),
    c.html('dl', undefined, ...iterPackagesComponents(pkgs, env)),
  )
}
