import { CoolError } from '../errors.ts'

export class RenderingSystemError extends CoolError {}
export class RenderError extends RenderingSystemError {}
export class ComponentLifecycleError extends RenderingSystemError {}
