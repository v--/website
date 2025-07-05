import { CoolError } from '../errors.ts'

export class CacheError extends CoolError {}
export class CacheMissError extends CacheError {}
