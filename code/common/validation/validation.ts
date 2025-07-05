import { SchemaValidationError } from './errors.ts'
import { type Infer } from './inference.ts'
import { type TypeSchema } from './schema.ts'
import { repr } from '../support/strings.ts'

export function validateSchema<T extends TypeSchema>(schema: T, value: unknown): Infer<T> {
  if (!schema.matches(value)) {
    throw new SchemaValidationError('Value does not match schema', { value, schema: repr(schema) })
  }

  return value as Infer<T>
}
