/* eslint-disable @stylistic/indent */
import {
  type ArrayTypeSchema,
  type BooleanTypeSchema,
  type FloatTypeSchema,
  type IntTypeSchema,
  type LiteralTypeSchema,
  type ObjectTypeSchema,
  type OptionalTypeSchema,
  type RecordTypeSchema,
  type RecursiveTypeSchema,
  type SelfReferenceSchema,
  type StringTypeSchema,
  type TypeSchema,
  type UintTypeSchema,
  type UnionTypeSchema,
} from './schema.ts'
import { type float64, type int32, type uint32 } from '../types/numbers.ts'
import { type Intersection } from '../types/typecons.ts'

type UnpackLiteralValues<Values extends Array<float64 | string>> =
  Values extends [infer Head, ...infer Rest extends Array<float64 | string>] ?
    Head | UnpackLiteralValues<Rest> :
    never

type UnpackUnionSubSchemas<SubSchemas extends Array<TypeSchema>> =
  SubSchemas extends [infer Head extends TypeSchema, ...infer Rest extends Array<TypeSchema>] ?
    Infer<Head> | UnpackUnionSubSchemas<Rest> :
    never

// Object inference would be straightforward if there was a way to conditionally apply type modifiers
// The general issue is discussed in https://github.com/microsoft/TypeScript/issues/32562
// We must separately build objects having required and optional parameters and later merge them
// This approach is based on https://stackoverflow.com/a/67577722/2756776
type OptionalObjectProperties<Properties extends Record<string, TypeSchema>> = {
  [Key in keyof Properties]: Properties[Key] extends OptionalTypeSchema<TypeSchema> ? Key : never
}[keyof Properties]

type RequiredObjectProperties<Properties extends Record<string, TypeSchema>> = {
  [Key in keyof Properties]: Properties[Key] extends OptionalTypeSchema<TypeSchema> ? never : Key
}[keyof Properties]

type UnpackObjectProperties<Properties extends Record<string, TypeSchema>> = Intersection<
  { [Key in RequiredObjectProperties<Properties>]: Infer<Properties[Key]> },
  { [Key in OptionalObjectProperties<Properties>]?: Infer<Properties[Key]> }
>

// The recursive schema requires writing a lot of code to achieve simple straightforward recursion
type ResolveUnionSubSchemas<T extends TypeSchema, SubSchemas extends Array<TypeSchema>> =
  SubSchemas extends [infer Head extends TypeSchema, ...infer Rest extends Array<TypeSchema>] ?
  [ResolveSelfReference<T, Head>, ...ResolveUnionSubSchemas<T, Rest>] :
  []

type ResolveSelfReference<T extends TypeSchema, UnresolvedSchema extends TypeSchema> =
  UnresolvedSchema extends SelfReferenceSchema ? T : // This is the only important line regarding recursive schemas
  UnresolvedSchema extends UnionTypeSchema<infer SubSchemas> ?
    UnionTypeSchema<ResolveUnionSubSchemas<T, SubSchemas>> :
  UnresolvedSchema extends OptionalTypeSchema<infer SubSchema> ?
    OptionalTypeSchema<ResolveSelfReference<T, SubSchema>> :
  UnresolvedSchema extends ArrayTypeSchema<infer SubSchema> ?
    ArrayTypeSchema<ResolveSelfReference<T, SubSchema>> :
  UnresolvedSchema extends ObjectTypeSchema<infer Properties> ?
    ObjectTypeSchema<{ [Key in keyof Properties]: ResolveSelfReference<T, Properties[Key]> }> :
  UnresolvedSchema

export type Infer<T extends TypeSchema> =
  T extends BooleanTypeSchema ? boolean :
  T extends FloatTypeSchema ? float64 :
  T extends IntTypeSchema ? int32 :
  T extends UintTypeSchema ? uint32 :
  T extends StringTypeSchema ? string :
  T extends LiteralTypeSchema<infer Values> ? UnpackLiteralValues<Values> :
  T extends UnionTypeSchema<infer SubSchemas> ? UnpackUnionSubSchemas<SubSchemas> :
  T extends OptionalTypeSchema<infer SubSchema> ? Infer<SubSchema> | undefined :
  T extends ArrayTypeSchema<infer SubSchema> ? Array<Infer<SubSchema>> :
  T extends RecordTypeSchema<infer KeySchema, infer ValueSchema> ? Record<Infer<KeySchema>, Infer<ValueSchema>> :
  T extends ObjectTypeSchema<infer Properties> ? UnpackObjectProperties<Properties> :
  T extends RecursiveTypeSchema<infer UnresolvedSchema> ? Infer<ResolveSelfReference<T, UnresolvedSchema>> :
  never
