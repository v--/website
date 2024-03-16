import { readFile } from 'fs/promises'

export interface IServerConfig {
  socket: string
}

export interface IStoreConfig {
  fileRootPath: string
  pacmanDBPath: string
}

export interface IWebsiteConfig {
  server: IServerConfig
  store: IStoreConfig
}

export const config: IWebsiteConfig = JSON.parse(await readFile('config/active.json', 'utf-8'))
