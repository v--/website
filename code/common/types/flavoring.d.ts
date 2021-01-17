// https://spin.atomicobject.com/2018/01/15/typescript-flexible-nominal-typing/
export interface Flavoring<K extends string> {
  ['@@flavoringSymbol']?: K
}

export type Flavor<T, K extends string> = T & Flavoring<K>
