import BrowserSync from 'browser-sync'
import findProcess from 'find-process'

import { type IBuildContext } from './build_worker.ts'
import { IntegrityError } from '../common/errors.ts'
import { waitForTime } from '../common/support/async.ts'

export function initBrowserSync(socket: string): BrowserSync.BrowserSyncInstance {
  if (!Number.isInteger(Number.parseInt(socket))) {
    throw new IntegrityError('BrowserSync does not support proxying sockets')
  }

  const instance = BrowserSync.create()
  instance.init({
    open: false,
    ghostMode: false,
    snippetOptions: {
      rule: {
        match: /<\/head>/u,
        fn(snippet, match) {
          return '<script src="/code/client/browsersync_injection.js" type="module"></script>' + match
        },
      },
    },
    proxy: 'localhost:' + socket,
    serveStatic: ['./public'],
  })

  return instance
}

export async function reloadServerData(contexts: IBuildContext[]) {
  if (contexts.some(ctx => ctx.dest.startsWith('private'))) {
    const processes = await findProcess('name', 'website')
    for (const { pid } of processes) {
      process.kill(pid, 'SIGUSR2')
    }
  }
}

export async function waitForServer(sync: BrowserSync.BrowserSyncInstance, contexts: IBuildContext[]): Promise<void> {
  // For common code files, used also by node, BrowserSync hangs on reload unless we wait.
  // It does not matter what files we tell BrowserSync to reload.
  //
  // I have figured that it may be a race condition with node's own reloading.
  // Thus, I have tried polling to make sure the server is serving files. But BrowserSync still hanged.
  //
  // A simple wait seems to do the trick. With less than 200ms, however, BrowserSync still hangs, and sometimes even with 200ms.

  if (contexts.some(ctx => ctx.src.startsWith('code/common'))) {
    await waitForTime(500)
  }
}

export async function reloadBrowserSync(sync: BrowserSync.BrowserSyncInstance, contexts: IBuildContext[]): Promise<void> {
  const paths = contexts
    .filter(ctx => ctx.dest.startsWith('public/'))
    .map(ctx => ctx.dest.slice('public/'.length))

  sync.notify('<div style="text-align: left"><b>Reloading</b><br />' + paths.join('<br />') + '</div>')

  // BrowserSync only reloads the page if there is at least one path
  if (paths.length > 0) {
    sync.reload(paths)
  } else {
    sync.reload()
  }
}
