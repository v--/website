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
