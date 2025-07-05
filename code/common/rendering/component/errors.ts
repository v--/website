import { CoolError } from '../../errors.ts'

export class ComponentError extends CoolError {}
export class ComponentSanityError extends ComponentError {}
export class InvalidComponentError extends ComponentError {}
