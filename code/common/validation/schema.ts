import { SchemaError } from './errors.ts'
import { getObjectEntries } from '../support/iteration.ts'
import { recursivelyStringify, repr } from '../support/strings.ts'
import { type float64, type int32, type uint32 } from '../types/numbers.ts'

/**
 * Base class for type schemas.
 * Every subclass must have a discriminator field (see e.g. isBoolean, isFloat)
 * so that TypeScript can distinguish between them. This allows constructing
 * a TypeScript type based on a type schema (see the Infer type constructor).
 */
export abstract class TypeSchema {
  abstract matches(value: unknown, recursiveRootSchema?: TypeSchema): boolean
  abstract toString(indentation?: uint32): string
}

export class BooleanTypeSchema extends TypeSchema {
  readonly isBoolean = true

  override matches(value: unknown, _recursiveRootSchema?: TypeSchema) {
    return typeof value === 'boolean'
  }

  override toString(_indentation?: uint32) {
    return 'Schema.boolean'
  }
}

export class FloatTypeSchema extends TypeSchema {
  readonly isFloat = true

  override matches(value: unknown, _recursiveRootSchema?: TypeSchema) {
    return typeof value === 'number'
  }

  override toString(_indentation?: uint32) {
    return 'Schema.float64'
  }
}

export class IntTypeSchema extends TypeSchema {
  readonly isInt = true

  override matches(value: unknown, _recursiveRootSchema?: TypeSchema) {
    return Number.isInteger(value)
  }

  override toString(_indentation?: uint32) {
    return 'Schema.int32'
  }
}

export class UintTypeSchema extends TypeSchema {
  readonly isUint = true

  override matches(value: unknown, _recursiveRootSchema?: TypeSchema) {
    return Number.isInteger(value) && (value as int32) >= 0
  }

  override toString(_indentation?: uint32) {
    return 'Schema.uint32'
  }
}

export class StringTypeSchema extends TypeSchema {
  readonly isString = true

  override matches(value: unknown, _recursiveRootSchema?: TypeSchema) {
    return typeof value === 'string'
  }

  override toString(_indentation?: uint32) {
    return 'Schema.string'
  }
}

export class LiteralTypeSchema<Values extends Array<float64 | string>> extends TypeSchema {
  readonly values: Values
  readonly isLiteral = true

  constructor(...values: Values) {
    super()
    this.values = values
  }

  override matches(value: unknown, _recursiveRootSchema?: TypeSchema) {
    return this.values.some(v => v === value)
  }

  override toString(_indentation?: uint32) {
    return `Schema.lit(${this.values.map(v => repr(v)).join(', ')})`
  }
}

export class UnionTypeSchema<SubSchemas extends TypeSchema[]> extends TypeSchema {
  readonly isUnion = true
  readonly subSchemas: SubSchemas

  constructor(...subSchemas: SubSchemas) {
    super()
    this.subSchemas = subSchemas
  }

  override matches(value: unknown, recursiveRootSchema?: TypeSchema) {
    return this.subSchemas.some(subschema => subschema.matches(value, recursiveRootSchema))
  }

  override toString(indentation: uint32 = 0) {
    const subSchemas = this.subSchemas

    return recursivelyStringify({
      prefix: 'Schema.union(',
      suffix: ')',
      indentation,
      * iterChildren(largeIndentation?: uint32) {
        for (const subschema of subSchemas) {
          yield subschema.toString(largeIndentation)
        }
      },
    })
  }
}

export class OptionalTypeSchema<SubSchema extends TypeSchema> extends TypeSchema {
  readonly isOptional = true
  readonly subSchema: SubSchema

  constructor(subSchema: SubSchema) {
    super()
    this.subSchema = subSchema
  }

  override matches(value: unknown, recursiveRootSchema?: TypeSchema) {
    return value === undefined || this.subSchema.matches(value, recursiveRootSchema)
  }

  override toString(_indentation?: uint32) {
    return `Schema.optional(${repr(this.subSchema)})`
  }
}

export class ArrayTypeSchema<SubSchema extends TypeSchema> extends TypeSchema {
  readonly isArray = true
  readonly subSchema: SubSchema

  constructor(subSchema: SubSchema) {
    super()
    this.subSchema = subSchema
  }

  override matches(values: unknown, recursiveRootSchema?: TypeSchema) {
    return values instanceof Array && values.every(v => this.subSchema.matches(v, recursiveRootSchema))
  }

  override toString(indentation: uint32 = 0) {
    const subSchema = this.subSchema

    return recursivelyStringify({
      prefix: 'Schema.array(',
      suffix: ')',
      indentation,
      * iterChildren(largeIndentation?: uint32) {
        yield subSchema.toString(largeIndentation)
      },
    })
  }
}

export class RecordTypeSchema<SubSchema extends TypeSchema> extends TypeSchema {
  readonly isRecord = true
  readonly subSchema: SubSchema

  constructor(subSchema: SubSchema) {
    super()
    this.subSchema = subSchema
  }

  override matches(record: unknown, recursiveRootSchema?: TypeSchema) {
    return record instanceof Object && Object.values(record).every(v => this.subSchema.matches(v, recursiveRootSchema))
  }

  override toString(indentation: uint32 = 0) {
    const subSchema = this.subSchema

    return recursivelyStringify({
      prefix: 'Schema.record(',
      suffix: ')',
      indentation,
      * iterChildren(largeIndentation?: uint32) {
        yield subSchema.toString(largeIndentation)
      },
    })
  }
}

export class ObjectTypeSchema<Properties extends Record<string, TypeSchema>> extends TypeSchema {
  readonly isObject = true
  readonly properties: Properties

  constructor(properties: Properties) {
    super()
    this.properties = properties
  }

  override matches(record: unknown, recursiveRootSchema?: TypeSchema) {
    if (!(record instanceof Object)) {
      return false
    }

    for (const [key, property] of getObjectEntries(this.properties)) {
      if (!property.matches((record as Record<keyof Properties, unknown>)[key], recursiveRootSchema)) {
        return false
      }
    }

    return true
  }

  override toString(indentation: uint32 = 0) {
    const properties = this.properties

    return recursivelyStringify({
      prefix: 'Schema.object({',
      suffix: '})',
      indentation,
      * iterChildren(largeIndentation?: uint32) {
        for (const [key, child] of getObjectEntries(properties)) {
          yield `${key as string}: ${child.toString(largeIndentation)}`
        }
      },
    })
  }
}

export class SelfReferenceSchema extends TypeSchema {
  readonly isSelf = true

  override matches(value: unknown, recursiveRootSchema?: TypeSchema): boolean {
    if (recursiveRootSchema === undefined) {
      throw new SchemaError('Cannot validate a recursive reference without a root schema provided')
    }

    return recursiveRootSchema.matches(value)
  }

  override toString(_indentation?: uint32) {
    return 'Schema.self'
  }
}

export class RecursiveTypeSchema<UnresolvedSchema extends TypeSchema> extends TypeSchema {
  readonly isRecursive = true
  readonly unresolved: UnresolvedSchema

  constructor(unresolved: UnresolvedSchema) {
    super()
    this.unresolved = unresolved
  }

  override matches(value: unknown, _recursiveRootSchemaSchema?: TypeSchema) {
    return this.unresolved.matches(value, this)
  }

  override toString(indentation: uint32 = 0) {
    const unresolved = this.unresolved

    return recursivelyStringify({
      prefix: 'Schema.recursive(',
      suffix: ')',
      indentation,
      * iterChildren(largeIndentation?: uint32) {
        yield unresolved.toString(largeIndentation)
      },
    })
  }
}

export const Schema = {
  boolean: new BooleanTypeSchema(),
  float64: new FloatTypeSchema(),
  int32: new IntTypeSchema(),
  uint32: new UintTypeSchema(),
  string: new StringTypeSchema(),
  self: new SelfReferenceSchema(),
  literal<Values extends Array<int32 | float64 | string>>(...values: Values) {
    return new LiteralTypeSchema<Values>(...values)
  },
  union<SubSchemas extends TypeSchema[]>(...subSchemas: SubSchemas) {
    return new UnionTypeSchema<SubSchemas>(...subSchemas)
  },
  optional<SubSchema extends TypeSchema>(value: SubSchema) {
    return new OptionalTypeSchema<SubSchema>(value)
  },
  array<SubSchema extends TypeSchema>(subSchema: SubSchema) {
    return new ArrayTypeSchema<SubSchema>(subSchema)
  },
  record<SubSchema extends TypeSchema>(subSchema: SubSchema) {
    return new RecordTypeSchema<SubSchema>(subSchema)
  },
  object<Properties extends Record<string, TypeSchema>>(properties: Properties) {
    return new ObjectTypeSchema<Properties>(properties)
  },
  recursive<UnresolvedSchema extends TypeSchema>(unresolved: UnresolvedSchema) {
    return new RecursiveTypeSchema<UnresolvedSchema>(unresolved)
  },
}
