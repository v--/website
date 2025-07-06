import { TranslationError } from './errors.ts'
import { type ITranslationPackage, type ITranslationSpec, type LanguageId } from './types.ts'
import { BehaviorSubject, Observable, map } from '../observable.ts'
import { type SubstitutionContext } from '../rich/substitution.ts'
import { convertPlainToRich, convertRichToPlain, substitutePlain, substituteRich } from '../rich.ts'
import { ExtendableFunction } from '../support/extendable_function.ts'
import { type TranslationBundleId } from '../types/bundles.ts'
import { type IFinalizeable } from '../types/finalizable.ts'

export interface IBoundGetTextSpec {
  bundleId?: TranslationBundleId
  key: string
  context?: SubstitutionContext
  coerce?: boolean
}

export interface IGetTextSpec extends ITranslationSpec, IBoundGetTextSpec {
  bundleId: TranslationBundleId
}

export class GetText extends ExtendableFunction<[IGetTextSpec], Observable<string>> implements IFinalizeable {
  #language$: BehaviorSubject<LanguageId>
  #package$: BehaviorSubject<ITranslationPackage>

  readonly language$: Observable<LanguageId>
  readonly package$: Observable<ITranslationPackage>

  constructor(language: LanguageId, pkg: ITranslationPackage = []) {
    super(
      (spec: IGetTextSpec) => this.plain$(spec),
    )

    this.#language$ = new BehaviorSubject(language)
    this.language$ = this.#language$

    this.#package$ = new BehaviorSubject(pkg)
    this.package$ = this.#package$
  }

  updateLanguage(newLanguage: LanguageId) {
    this.#language$.next(newLanguage)
  }

  updatePackage(newPackage: ITranslationPackage) {
    this.#package$.next(newPackage)
  }

  #getTranslationMap(pkg: ITranslationPackage, languageId: LanguageId, bundleId: TranslationBundleId) {
    const entry = pkg.find(e => e.languageId === languageId && e.bundleId === bundleId)

    if (entry === undefined) {
      throw new TranslationError(
        'Translation map has not been loaded',
        { languageId, bundleId },
      )
    }

    return entry.map
  }

  #getTranslationValue(pkg: ITranslationPackage, languageId: LanguageId, bundleId: TranslationBundleId, key: string) {
    const map = this.#getTranslationMap(pkg, languageId, bundleId)
    const rawValue = map[key]

    if (rawValue === undefined) {
      throw new TranslationError(
        'Missing translation',
        { languageId, bundleId, key },
      )
    }

    return rawValue
  }

  #plain(pkg: ITranslationPackage, languageId: LanguageId, spec: IGetTextSpec) {
    const rawValue = this.#getTranslationValue(pkg, languageId, spec.bundleId, spec.key)

    if (typeof rawValue !== 'string') {
      if (spec.coerce) {
        const converted = convertRichToPlain(rawValue)
        return spec.context ? substitutePlain(converted, spec.context) : converted
      }

      throw new TranslationError(
        'Expecting a plain string translation, but got rich text',
        { languageId, bundleId: spec.bundleId, key: spec.key },
      )
    }

    return spec.context ? substitutePlain(rawValue, spec.context) : rawValue
  }

  #rich(pkg: ITranslationPackage, languageId: LanguageId, spec: IGetTextSpec) {
    const rawValue = this.#getTranslationValue(pkg, languageId, spec.bundleId, spec.key)

    if (typeof rawValue === 'string') {
      if (spec.coerce) {
        const converted = convertPlainToRich(rawValue)
        return spec.context ? substituteRich(converted, spec.context) : converted
      }

      throw new TranslationError(
        'Expecting a rich string translation, but got plain text',
        { languageId, bundleId: spec.bundleId, key: spec.key },
      )
    }

    return spec.context ? substituteRich(rawValue, spec.context) : rawValue
  }

  plain(spec: IGetTextSpec) {
    return this.#plain(
      this.#package$.value,
      this.#language$.value,
      spec,
    )
  }

  plain$(spec: IGetTextSpec) {
    return this.language$.pipe(
      map(lang => this.#plain(this.#package$.value, lang, spec)),
    )
  }

  rich(spec: IGetTextSpec) {
    return this.#rich(
      this.#package$.value,
      this.#language$.value,
      spec,
    )
  }

  rich$(spec: IGetTextSpec) {
    return this.language$.pipe(
      map(lang => this.#rich(this.#package$.value, lang, spec)),
    )
  }

  async finalize() {
    this.#language$.complete()
    this.#package$.complete()
  }

  bindToBundle(bundleId: TranslationBundleId) {
    return new BoundGetText(this, bundleId)
  }
}

export class BoundGetText extends ExtendableFunction<[string | IBoundGetTextSpec], Observable<string>> {
  readonly gettext: GetText
  readonly defaultBundleId: TranslationBundleId

  constructor(gettext: GetText, defaultBundleId: TranslationBundleId) {
    super(
      (spec: string | IBoundGetTextSpec) => this.plain$(spec),
    )

    this.gettext = gettext
    this.defaultBundleId = defaultBundleId
  }

  #liftPartialSpec(pspec: string | IBoundGetTextSpec): IGetTextSpec {
    if (typeof pspec === 'string') {
      return {
        bundleId: this.defaultBundleId,
        key: pspec,
      }
    }

    return {
      ...pspec,
      bundleId: pspec.bundleId ?? this.defaultBundleId,
    }
  }

  plain(pspec: string | IBoundGetTextSpec) {
    return this.gettext.plain(this.#liftPartialSpec(pspec))
  }

  plain$(pspec: string | IBoundGetTextSpec) {
    return this.gettext.plain$(this.#liftPartialSpec(pspec))
  }

  rich(pspec: string | IBoundGetTextSpec) {
    return this.gettext.rich(this.#liftPartialSpec(pspec))
  }

  rich$(pspec: string | IBoundGetTextSpec) {
    return this.gettext.rich$(this.#liftPartialSpec(pspec))
  }

  async finalize() {}
}
