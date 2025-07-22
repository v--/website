# Data validation

I have implemented here a straightforward schema-based data validator based, ideologically, on [TypeBox](https://github.com/sinclairzx81/typebox).

The implementation is fairly straightforward - refer, for example, to the schema-to-type code in [`./inference.ts`](./inference.ts).

__Warning__: Validation error reporting is very primitive - it simply says that the (root) value mismatches the schema. The reason for this is that there is no clear answer as to how to show which value mismatches which sub-schema. Think of the confusing interface mismatches reported by TypeScript. There are possible approaches to make validation errors clearer, but truly any data validation is already an overkill for my website, so I did not bother with detailed errors.

## Usage example

The schema for our rich text system (see [`../rich`](../rich)) demonstrates our feature set quite well:
```
const RICH_TEXT_ENTRY_SCHEMA = Schema.recursive(
  Schema.union(
    ...
    Schema.object({
      kind: Schema.literal('heading'),
      level: Schema.literal(1, 2, 3, 4, 5, 6),
      text: Schema.optional(Schema.string),
      content: Schema.optional(
        Schema.array(Schema.self)
      ),
    }),
    ...
  ),
)
```

Most of the code above should be straightforward to understand; some subtleties will be commented below. The ellipses hide code that is similar to what is shown.

All objects produced by the `Schema` helper are `TypeSchema` instances. The `Infer` type constructor can be used to build a TypeScript type from a `TypeSchema` instance. We use the following:
```
type IRichTextEntry = Infer<typeof RICH_TEXT_ENTRY_SCHEMA>
```

TypeScript then shows `IRichTextEntry` as
```
type IRichTextEntry = {
  ...
} | {
  kind: 'heading'
  level: 1 | 2 | 3 | 4 | 5 | 6
  text?: string | undefined
  content?: ... | undefined
} | {
  ...
}
```

The `content` field is resolved to a reference to the (anonymous to the `Infer` type constructor) type assigned to `IRichTextEntry`; that is, it resolves the self-reference that we have marked via `Schema.self`. Such resolution is only possible in the presence of a wrapping `Schema.recursive` schema somewhere in the hierarchy, which signals where `Schema.self` should point.

The `uint32` type above is defined by [flavoring](https://spin.atomicobject.com/2018/01/15/typescript-flexible-nominal-typing/) the builtin type `number`. Our schemas are able to validate unsigned integers, but there is no way to prevent anybody from assigning an arbitrary floating point number to a variable annotated with `uint32`.

If `rawEntry` contains an object that is possibly a rich text entry, we can validate it as follows:
```
const entry = validateSchema(RICH_TEXT_ENTRY_SCHEMA, rawEntry)
```

The above function will throw an error on schema mismatch. Both `entry` and `rawEntry` will point to the same object, but `entry` will have the type inferred from the schema.
