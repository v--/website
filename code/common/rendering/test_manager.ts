import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, it } from 'node:test'

import { BehaviorSubject, Subject, SubscriptionObserver, map } from '../observable.ts'
import { Component, ComponentSanityError, HtmlComponent, type IComponentEnvironment, createComponent as c } from './component.ts'
import { RenderError } from './errors.ts'
import { RenderingManager } from './manager.ts'
import { ServerLogger } from '../../server/logger.ts'
import { assertEmpty, assertEqualRepr, assertFalse, assertTrue } from '../../testing/assertion.ts'
import { MirrorDomError, MirrorDomManipulator } from '../../testing/unit/mirror_dom.ts'
import { assertNoLivingObservableSubscriptions } from '../../testing/unit/observable.ts'
import { type Action } from '../types/typecons.ts'

interface ITextOnlyState {
  text?: string
}

const TEST_COMPONENT_ENV = {}

describe('RenderingManager class with MirrorDomManipulator', function () {
  let manager: RenderingManager<HtmlComponent>

  beforeEach(async function () {
    manager = new RenderingManager(
      new ServerLogger('RENDERING_TEST', 'DEBUG'),
      new MirrorDomManipulator(),
      TEST_COMPONENT_ENV,
    )
  })

  afterEach(async function () {
    await manager?.finalize()
  })

  async function updateAndWait<T>(subject$: Subject<T>, value: T, src?: Component) {
    const promise = manager.awaitRendering(src)
    subject$.next(value)
    await promise
  }

  describe('for XML components', function () {
    describe('render method', function () {
      it('renders simple components', async function () {
        const src = c.html('div')
        const dest = await manager.render(src)
        assertEqualRepr(src, dest)
      })

      it('renders components with state', async function () {
        const src = c.html('div', { a: 0 })
        const dest = await manager.render(src)
        assertEqualRepr(src, dest)
      })

      it('renders components with text children', async function () {
        const src = c.html('div', { text: 'text' })
        const dest = await manager.render(src)
        assertEqualRepr(src, dest)
      })

      it('renders components with HTML children', async function () {
        const src = c.html('div', undefined, c.html('span'), c.html('span', { text: 'text' }))
        const dest = await manager.render(src)
        assertEqualRepr(src, dest)
      })
    })

    describe('triggered rerender', function () {
      it('adds new properties', async function () {
        const subject$ = new BehaviorSubject<ITextOnlyState>({})
        const src = c.html('div', subject$)
        const dest = await manager.render(src)
        await updateAndWait(subject$, { text: 'text' }, src)

        const state = await dest.getState() as ITextOnlyState
        assert.equal(state.text, 'text')

        subject$.complete()
      })

      it('updates existing properties', async function () {
        const subject$ = new BehaviorSubject<ITextOnlyState>({ text: 'text' })
        const src = c.html('div', subject$)
        const dest = await manager.render(src)
        await updateAndWait(subject$, { text: 'updated text' }, src)

        const state = await dest.getState() as ITextOnlyState
        assert.equal(state.text, 'updated text')

        subject$.complete()
      })

      it('removes old properties', async function () {
        const subject$ = new BehaviorSubject<ITextOnlyState>({ text: 'text' })
        const src = c.html('div', subject$)
        const dest = await manager.render(src)
        await updateAndWait(subject$, {}, src)

        assertEmpty(await dest.getState() as object)

        subject$.complete()
      })

      it('errors out when adding text to an HTML component with children', async function () {
        const subject$ = new BehaviorSubject<ITextOnlyState>({})
        const src = c.html('div', subject$, c.html('span'))
        await manager.render(src)

        await assert.rejects(
          updateAndWait(subject$, { text: 'text' }, src),
          ComponentSanityError,
        )

        subject$.complete()
      })

      it('can rerender multiple times', async function () {
        const subject$ = new BehaviorSubject<ITextOnlyState>({ text: 'basic' })

        const src = c.html('div', subject$)
        const dest = await manager.render(src)

        await updateAndWait(subject$, { text: 'extended' }, src)
        await updateAndWait(subject$, { text: 'premium' }, src)

        const state = await dest.getState() as ITextOnlyState
        assert.equal(state.text, 'premium')

        subject$.complete()
      })

      it('supports different observables for different attributes', async function () {
        interface IState {
          a: 'string'
          b: 'string'
        }

        const subjectA$ = new BehaviorSubject<string>('basic')
        const subjectB$ = new BehaviorSubject<string>('basic')

        const src = c.html('div', { a: subjectA$, b: subjectB$ })
        const dest = await manager.render(src)

        let state = await dest.getState() as IState
        assert.equal(state.a, 'basic')
        assert.equal(state.b, 'basic')

        await updateAndWait(subjectA$, 'extended', src)
        state = await dest.getState() as IState
        assert.equal(state.a, 'extended')
        assert.equal(state.b, 'basic')

        await updateAndWait(subjectB$, 'extended', src)
        state = await dest.getState() as IState
        assert.equal(state.a, 'extended')
        assert.equal(state.b, 'extended')

        subjectA$.complete()
        subjectB$.complete()
      })
    })
  })

  describe('for factory components', function () {
    describe('render method', function () {
      it('renders constants', async function () {
        const constant = await manager.render(c.html('div'))
        const src = c.factory(() => constant, {})
        const dest = await manager.render(src)

        assertEqualRepr(dest, constant)
      })

      it('renders simple text', async function () {
        const src = c.factory(({ text }: ITextOnlyState) => c.html('span', { text }), { text: 'text' })
        const dest = await manager.render(src)

        const state = await dest.getState() as ITextOnlyState
        assert.equal(state.text, 'text')
      })

      it('errors out when attempting to render the same child component twice', async function () {
        const component = c.html('span')

        function factory() {
          return c.html('div', undefined, component, component)
        }

        await assert.rejects(
          manager.render(c.factory(factory, {})),
          RenderError,
        )
      })
    })

    describe('triggered rerender', function () {
      // This is only about the uppermost root which has no known parent.
      // If a parent exists, we support replacing the factory's root type (see the test labeled BF7).
      it('disallows replacing the root element\'s type', async function () {
        const subject$ = new BehaviorSubject({ type: 'div' })
        const src = c.factory(({ type }) => c.html(type), subject$)
        await manager.render(src)

        await assert.rejects(
          updateAndWait(subject$, { type: 'span' }, src),
          MirrorDomError,
        )

        subject$.complete()
      })

      it('supports replacing the root element\'s type', async function () {
        interface IState {
          type: string
        }

        const subject$ = new BehaviorSubject<IState>({ type: 'div' })
        const src = c.factory(({ type }) => c.html('div', undefined, c.html(type)), subject$)
        const dest = await manager.render(src)

        await updateAndWait(subject$, { type: 'span' }, src)
        assert.equal(dest.getNthChild(0).type, 'span')

        subject$.complete()
      })

      it('adds root children', async function () {
        const subject$ = new BehaviorSubject({ add: false })
        const src = c.factory(({ add }) => c.html('div', undefined, add && c.html('span')), subject$)
        const dest = await manager.render(src)

        await updateAndWait(subject$, { add: true }, src)
        assertTrue(dest.hasChildren())

        subject$.complete()
      })

      it('updates root element\'s properties', async function () {
        const subject$ = new BehaviorSubject<ITextOnlyState>({ text: 'text' })
        const src = c.factory(({ text }) => c.html('div', { text }), subject$)
        const dest = await manager.render(src)

        await updateAndWait(subject$, { text: 'updated text' }, src)
        const state = await dest.getState() as ITextOnlyState
        assert.equal(state.text, 'updated text')

        subject$.complete()
      })

      it('replaces root children', async function () {
        const subject$ = new BehaviorSubject({ type: 'div' })
        const src = c.factory(({ type }) => c.html('div', undefined, c.html(type)), subject$)
        const dest = await manager.render(src)

        subject$.next({ type: 'span' })
        await updateAndWait(subject$, { type: 'span' }, src)
        assert.equal(dest.getNthChild(0).type, 'span')

        subject$.complete()
      })

      it('removes root children', async function () {
        const subject$ = new BehaviorSubject({ add: true })
        const src = c.factory(({ add }) => c.html('div', undefined, add && c.html('span')), subject$)
        const dest = await manager.render(src)

        await updateAndWait(subject$, { add: false }, src)
        assertFalse(dest.hasChildren())

        subject$.complete()
      })

      it('handles swapping', async function () {
        interface IThreeComponentState {
          components: [string, string, string]
        }

        const subject$ = new BehaviorSubject<IThreeComponentState>({ components: ['h1', 'h2', 'h3'] })

        function factory({ components }: IThreeComponentState) {
          return c.html('div', undefined, c.html(components[0]), c.html(components[1]), c.html(components[2]))
        }

        const src = c.factory(factory, subject$)
        const dest = await manager.render(src)

        await updateAndWait(subject$, { components: ['h3', 'h2', 'h1'] }, src)

        assert.deepEqual(
          Array.from(dest.iterChildren()).map(child => child.type),
          ['h3', 'h2', 'h1'],
        )

        subject$.complete()
      })

      it('throws when swapping existing elements', async function () {
        interface IThreeComponentState {
          components: [Component, Component, Component]
        }

        const h1 = c.html('h1')
        const h2 = c.html('h2')
        const h3 = c.html('h3')

        const subject$ = new BehaviorSubject<IThreeComponentState>({ components: [h1, h2, h3] })

        function factory({ components }: IThreeComponentState) {
          return c.html('div', undefined, ...components)
        }

        const src = c.factory(factory, subject$)
        await manager.render(src)

        await assert.rejects(
          updateAndWait(subject$, { components: [h3, h2, h1] }, src),
          RenderError,
        )

        subject$.complete()
      })

      it('handles nested component swapping', async function () {
        interface IThreeComponentState {
          components: [string, string, string]
        }

        const subject$ = new BehaviorSubject<IThreeComponentState>({ components: ['h1', 'h2', 'h3'] })

        function factory({ components }: IThreeComponentState) {
          return c.html('main', undefined,
            c.html('div', undefined, c.html(components[0]), c.html(components[1]), c.html(components[2])),
          )
        }

        const src = c.factory(factory, subject$)
        const dest = await manager.render(src)

        await updateAndWait(subject$, { components: ['h3', 'h2', 'h1'] }, src)

        assert.deepEqual(
          Array.from(dest.getNthChild(0).iterChildren()).map(child => child.type),
          ['h3', 'h2', 'h1'],
        )

        subject$.complete()
      })

      it('can rerender multiple times', async function () {
        const subject$ = new BehaviorSubject<ITextOnlyState>({ text: 'basic' })

        function factory({ text }: ITextOnlyState) {
          return c.html('span', { text })
        }

        const src = c.factory(factory, subject$)
        const dest = await manager.render(src)

        await updateAndWait(subject$, { text: 'extended' }, src)
        await updateAndWait(subject$, { text: 'premium' }, src)

        const state = await dest.getState() as ITextOnlyState
        assert.equal(state.text, 'premium')

        subject$.complete()
      })

      it('can rerender multiple components using the same observable', async function () {
        const outerSubject$ = new BehaviorSubject<ITextOnlyState>({})
        const subject$ = new BehaviorSubject<ITextOnlyState>({ text: 'text' })

        function factory1({ text }: ITextOnlyState) {
          return c.html('p', { text })
        }

        function factory2({ text }: ITextOnlyState) {
          return c.html('p', { text })
        }

        function outerFactory() {
          return c.html(
            'div',
            {},
            c.factory(factory1, subject$),
            c.factory(factory2, subject$),
          )
        }

        const src = c.factory(outerFactory, outerSubject$)
        const dest = await manager.render(src)

        subject$.next({ text: 'updated text' })
        await manager.awaitRendering()

        const firstChildState = await dest.getNthChild(0).getState() as ITextOnlyState
        const secondChildState = await dest.getNthChild(1).getState() as ITextOnlyState

        assert.equal(firstChildState.text, 'updated text')
        assert.equal(secondChildState.text, 'updated text')

        outerSubject$.complete()
        subject$.complete()
      })

      // BUGFIXES

      // It is important that the first rerendering finishes before the second one starts
      // Short identifier for test: BF1
      it('can rerender multiple with subcomponent replacements', async function () {
        interface IState {
          type: string
        }

        const subject$ = new BehaviorSubject({ type: 'div' })

        function factory({ type }: IState) {
          return c.html('div', undefined, c.html(type))
        }

        const src = c.factory(factory, subject$)
        const dest = await manager.render(src)

        subject$.next({ type: 'span' })
        subject$.next({ type: 'div' })

        await manager.awaitPendingRerenders()

        assert.equal(dest.getNthChild(0).type, 'div')
        subject$.complete()
      })

      // We take the active state with a mutator and expect the mutator to update the state.
      // The observable is not a parameter of the topmost factory, so we rely on its children to subscribe.
      // Short identifier for test: BF2
      it('can rerender on observable change in a nested component', async function () {
        interface IInnerState {
          text: string
          updateText: Action<string>
        }

        function updateText(text: string) {
          subject$.next({ updateText, text })
        }

        const subject$ = new BehaviorSubject<IInnerState>({
          text: 'text',
          updateText,
        })

        function factory() {
          return c.html('div', subject$)
        }

        const src = c.factory(factory)
        const dest = await manager.render(src)

        let state: IInnerState = await dest.getState() as IInnerState
        state.updateText('updated text')

        await manager.awaitRendering()

        state = await dest.getState() as IInnerState
        assert.equal(state.text, 'updated text')

        subject$.complete()
      })

      // Here both the parent and its child have their distinct observables updated.
      // We verify that the parent's update does not confuse the child's subscription.
      // Short identifier for test: BF3
      it('can rerender on nested observable change if the parent has also changed', async function () {
        const outerSubject$ = new BehaviorSubject<void>(undefined)

        function updateText(text: string) {
          subject$.next({ updateText, text })
        }

        const subject$ = new BehaviorSubject<IInnerState>({
          text: 'text',
          updateText,
        })

        interface IInnerState {
          text: string
          updateText: Action<string>
        }

        function factory() {
          return c.html('div', subject$)
        }

        const src = c.factory(factory, outerSubject$)
        const dest = await manager.render(src)

        outerSubject$.next()
        await manager.awaitPendingRerenders()

        let state: IInnerState = await dest.getState() as IInnerState
        state.updateText('updated text')

        await manager.awaitRendering()
        state = await dest.getState() as IInnerState
        assert.equal(state.text, 'updated text')

        subject$.complete()
        outerSubject$.complete()
      })

      // Here we verify that the children of nested rendered components get updated recursively.
      // Short identifier for test: BF4
      it('can rerender on observable change in transcluded components nested in XML components', async function () {
        const outerSubject$ = new BehaviorSubject<ITextOnlyState>({ text: 'text' })

        function transcluded(_context: unknown, env: IComponentEnvironment, children: Component[]) {
          return c.html('main', undefined, ...children)
        }

        function factory({ text }: ITextOnlyState) {
          return c.html('div', { text })
        }

        function outerFactory({ text }: ITextOnlyState) {
          return c.html('body', undefined,
            c.factory(transcluded, undefined,
              c.factory(factory, { text }),
            ),
          )
        }

        const src = c.factory(outerFactory, outerSubject$)
        const dest = await manager.render(src)

        await updateAndWait(outerSubject$, { text: 'updated text' }, src)

        const innerState = await dest.getNthChild(0).getNthChild(0).getState() as ITextOnlyState
        assert.equal(innerState.text, 'updated text')

        outerSubject$.complete()
      })

      // Here we verify that nested rendered components can also get new children appended.
      // Short identifier for test: BF5
      it('can add new children to transcluded components nested in XML components', async function () {
        const outerSubject$ = new BehaviorSubject<ITextOnlyState>({ text: 'text' })

        function transcluded(_context: unknown, env: IComponentEnvironment, children: Component[]) {
          return c.html('main', undefined, ...children)
        }

        function factory({ text }: ITextOnlyState) {
          return c.html('div', { text })
        }

        function outerFactory({ text }: ITextOnlyState) {
          return c.html('body', undefined,
            c.factory(transcluded, {},
              text && c.factory(factory, { text }),
            ),
          )
        }

        const src = c.factory(outerFactory, outerSubject$)
        const dest = await manager.render(src)

        outerSubject$.next({ text: 'text' })
        await manager.awaitPendingRerenders()

        const innerState = await dest.getNthChild(0).getNthChild(0).getState() as ITextOnlyState
        assert.equal(innerState.text, 'text')

        outerSubject$.complete()
      })

      // Here several sibling factory components have distinct HTML children.
      // It is important to synchronize the children before the state source.
      // The latter will trigger a rerender, and the factory may receive outdated children.
      // Short identifier for test: BF6
      it('can remove the middle of three heterogeneous siblings', async function () {
        interface IOuterState {
          removeMiddleChild: boolean
        }

        interface IInnerState {
          id: string
        }

        const subject$ = new BehaviorSubject<IOuterState>({ removeMiddleChild: false })

        function innerFactory({ id }: IInnerState, env: IComponentEnvironment, children: Component[]) {
          return c.html('p', { id }, ...children)
        }

        function factory({ removeMiddleChild }: IOuterState) {
          return c.html('div', undefined,
            c.factory(innerFactory, { id: '1' }, c.html('b', { text: '1' })),
            !removeMiddleChild && c.factory(innerFactory, { id: '2' }, c.html('em', { text: '2' })),
            c.factory(innerFactory, { id: '3' }, c.html('span', { text: '3' })),
          )
        }

        const src = c.factory(factory, subject$)
        const dest = await manager.render(src)

        await updateAndWait(subject$, { removeMiddleChild: true }, src)
        const children = Array.from(dest.iterChildren())

        assert.equal(children.length, 2)

        const firstState = await children[0].getNthChild(0).getState() as ITextOnlyState
        const secondState = await children[1].getNthChild(0).getState() as ITextOnlyState

        assert.equal(firstState.text, '1')
        assert.equal(secondState.text, '3')

        subject$.complete()
      })

      // Here the same factory component get rendered twice initially with different root component types.
      // The first one disappears and the second one must replace it, but it cannot because of incompatibility.
      // This originated from the error page, where the rich text component for a cause is sometimes displayed and sometimes not.
      // Short identifier for test: BF7
      it('can resolve conflicts between factory components with the same factory producing different tags', async function () {
        interface IOuterState {
          removeChild: boolean
        }

        interface IInnerState {
          tag: string
        }

        const subject$ = new BehaviorSubject<IOuterState>({ removeChild: false })

        function innerFactory({ tag }: IInnerState) {
          return c.html(tag)
        }

        function factory({ removeChild }: IOuterState) {
          return c.html('div', undefined,
            !removeChild && c.factory(innerFactory, { tag: 'em' }),
            c.factory(innerFactory, { tag: 'strong' }),
          )
        }

        const src = c.factory(factory, subject$)
        await manager.render(src)

        await assert.doesNotReject(
          updateAndWait(subject$, { removeChild: true }),
          RenderError,
        )

        subject$.complete()
      })
    })
  })

  describe('finalization', function () {
    describe('#finalizeRenderer()', function () {
      it('cleans up a simple root subscription', async function () {
        const subject$ = new BehaviorSubject<ITextOnlyState>({ text: 'test' })
        const src = c.html('p', subject$)
        await manager.render(src)
        await manager.finalizeRenderer(await manager.getRenderer(src))
        subject$.complete()

        assertNoLivingObservableSubscriptions()
      })

      it('managed components get finalized', async function () {
        class CustomComponent extends HtmlComponent {
          isFinalized = false

          override async finalize() {
            await super.finalize()
            this.isFinalized = true
          }
        }

        const subject$ = new BehaviorSubject<ITextOnlyState>({ text: 'test' })
        const src = new CustomComponent('p', subject$, [])
        manager.markComponentAsManaged(src)
        await manager.render(src)
        await manager.finalizeRenderer(await manager.getRenderer(src))
        subject$.complete()

        assertTrue(src.isFinalized)
      })

      it('non-managed components do not get finalized', async function () {
        class CustomComponent extends HtmlComponent {
          isFinalized = false

          override async finalize() {
            await super.finalize()
            this.isFinalized = true
          }
        }

        const subject$ = new BehaviorSubject<ITextOnlyState>({ text: 'test' })
        const src = new CustomComponent('p', subject$, [])
        await manager.render(src)
        await manager.finalizeRenderer(await manager.getRenderer(src))
        subject$.complete()

        assertFalse(src.isFinalized)
      })

      it('cleans up XML subscriptions inside a factory component', async function () {
        const subject$ = new BehaviorSubject('test')

        function factory() {
          return c.html('div', undefined,
            c.html('p', { text: subject$ }),
          )
        }

        const src = c.factory(factory)
        await manager.render(src)
        await manager.finalizeRenderer(await manager.getRenderer(src))
        subject$.complete()

        assertNoLivingObservableSubscriptions()
      })

      it('cleans up nested factory subscriptions', async function () {
        const subject$ = new BehaviorSubject('test')

        function innerFactory({ text }: ITextOnlyState) {
          return c.html('p', { text })
        }

        function outerFactory() {
          return c.factory(innerFactory, { text: subject$ })
        }

        const src = c.factory(outerFactory)
        await manager.render(src)
        await manager.finalizeRenderer(await manager.getRenderer(src))
        subject$.complete()

        assertNoLivingObservableSubscriptions()
      })
    })

    describe('automatic finalization', function () {
      it('nested components clean up their own subscriptions after updates', async function () {
        const subject$ = new BehaviorSubject('test')

        function innerFactory({ text }: ITextOnlyState) {
          return c.html('p', { text })
        }

        function outerFactory() {
          return c.factory(innerFactory, { text: subject$ })
        }

        const src = c.factory(outerFactory)
        await manager.render(src)

        const livingCount = SubscriptionObserver.getLivingObserverCount()

        subject$.next('updated text')

        assert.equal(SubscriptionObserver.getLivingObserverCount(), livingCount)
        subject$.complete()
      })

      it('when constructing new observables inside components, old ones get cleaned up on rerender', async function () {
        const outerSubject$ = new BehaviorSubject({ text: 'outer text' })
        const innerSubject$ = new BehaviorSubject({ text: 'inner text' })

        function outerFactory({ text: outerText }: ITextOnlyState) {
          const text$ = innerSubject$.pipe(
            map(({ text: innerText }) => outerText + ' ' + innerText),
          )

          return c.html('p', { text: text$ })
        }

        const src = c.factory(outerFactory, outerSubject$)
        await manager.render(src)

        const livingCount = SubscriptionObserver.getLivingObserverCount()

        outerSubject$.next({ text: 'updated outer text' })
        await manager.awaitRendering()

        assert.equal(SubscriptionObserver.getLivingObserverCount(), livingCount)
        outerSubject$.complete()
      })
    })
  })
})
