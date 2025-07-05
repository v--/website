import { readJsonWithSchema } from './validation.ts'
import { type Infer, Schema } from '../common/validation.ts'

export const SERVER_CONFIG_SCHEMA = Schema.object({
  socket: Schema.string,
  processName: Schema.string,
})

export type IServerConfig = Infer<typeof SERVER_CONFIG_SCHEMA>

export const SERVICE_CONFIG_SCHEMA = Schema.object({
  files: Schema.object({
    realRoot: Schema.string,
    mockRoot: Schema.string,
  }),
  pacman: Schema.object({
    dbPath: Schema.string,
  }),
  icons: Schema.object({
    root: Schema.string,
  }),
  translation: Schema.object({
    root: Schema.string,
  }),
})

export type IServiceConfig = Infer<typeof SERVICE_CONFIG_SCHEMA>

export const WEBSITE_CONFIG_SCHEMA = Schema.object({
  server: SERVER_CONFIG_SCHEMA,
  services: SERVICE_CONFIG_SCHEMA,
})

export interface IWebsiteConfig extends Infer<typeof WEBSITE_CONFIG_SCHEMA> {
  server: IServerConfig
  services: IServiceConfig
}

export async function readConfig(): Promise<IWebsiteConfig> {
  return readJsonWithSchema(WEBSITE_CONFIG_SCHEMA, 'config/active.json')
}
