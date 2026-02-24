# Reactive component rendering

This is the bread and butter of my website. I have [introduced](https://github.com/v--/website/tree/c6e425f026bf17e6aa71a2e5f9ca550a1bcf2ebf) the component system on 2017-04-09, but, except for the following very basic ideas, had nearly nothing to do with that it is currently.

1. There are HTML components:
    ```
    c.html('button', {
      text: 'Click me',
      update(event: PointerEvent) {
        console.log('He clicked me!')
      },
    })
    ```

2. There are factory functions which produce HTML components:
    ```
    function exampleFactory({ text }: IExampleFactoryState) {
      return c.html('p', { text })
    }
    ```

3. These can be wrapped into factory components as follows:
    ```
    c.factory(exampleFactory, { text: 'example' })
    ```

4. Reactivity is achieved by using observables instead of state objects. For example, the following component will render its contents into `node` and rerender every time `state$` emits:
    ```
    const state$ = new BehaviorSubject({ text: 'initial' })
    const component = c.html('p', state$)
    const node = await manager.render(component)
    ```

## Inspiration

Syntax-wise, the code above resembles [React](https://react.dev/) without [JSX](https://facebook.github.io/jsx/). I never understood the appeal of JSX, but liked the base idea of React's virtual DOM.

In 2015-2016, smaller frameworks (e.g. [Vue](https://vuejs.org/)) had already managed to find their place under the sun, with different solutions to reactivity (e.g. Vue's proxied model objects).

On the other hand, custom elements started making their way into the DOM standard, proliferated by [Polymer](https://polymer-library.polymer-project.org/) and related projects. APIs like [mutation observers](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) started appearing, making it possible to write custom elements while staying close, conceptually, to the DOM.

There were many solutions to reactivity, and none of them scratched the itch as satisfyingly as the observables that started becoming popular in the early days of [Angular](https://angular.dev/) (not [angular.js](https://angularjs.org/)). That was when [RxJS](https://rxjs.dev/) started showing its power to the masses.

I had the sudden realization that the virtual DOM fits nicely with the idea of observables. I tried to implement this, and soon found out that I could achieve a lot by following only this simple approach.

__Note:__ As explained in the README in [`../observable`](../observable), my understanding of observables at the time was not based on RxJS itself but rather on some obsolete (at the time) ideas. I only later realized the benefits of the cold-observable-pipe approach of RxJS.

## Components

The [`Component`](./component/component.ts) class is a building block for our virtual DOM. It consists of the following:

1. A type. The type can be a string as in [`XmlComponent`](./component/xml.ts) and its subclasses ([`HtmlComponent`](./component/html.ts), [`SvgComponent`](./component/svg.ts) and [`MathMLComponent`](./component/mathml.ts)), or a function as in [`FactoryComponent`](./component/factory.ts). It can of course be anything else, but these are the only things we have any idea how to render.

2. A state source. We support several kinds of sources:
    1. Undefined (i.e. the component needs no state)
        ```
        c.html('button', undefined)
        ```
        or simply
        ```
        c.html('button')
        ```

    2. A plain object:
        ```
        c.html('button', { text: 'text', title: 'title' })
        ```

    3. An observable:
        ```
        c.html('button', buttonState$)
        ```

    4. A dictionary of observables (transformed into a single observable using [`combineLatest`](../observable/operators/combine_latest.ts)):
        ```
        c.html('button', { text: text$, title: title$ })
        ```

        We deviate from RxJS in that `combineLatest` supports some of the properties to be plain non-observable values and even promises or arrays that would not get transformed into observables. For example, we can use a mixture of observable and non-observable properties:
        ```
        c.html('button', { text: text$, title: 'title' })
        ```

3. Finally, a component may have a list of other components as children. We can thus write
    ```
    c.html('a', { href: 'http://example.com' },
      c.html('b', { text: 'Bold text in a link' }),
    )
    ```

## Validation

We do some basic validation in the `prevalidateNewState` method of the components, as well as when updating the state sources themselves.

In general, proper component creation validation requires a lot of mundane code, as well as "synthetic events" that wrap those from the DOM. We see no benefit to this validation here, but if we were to release this as a standalone library, such validation would be required.

## Environments

Environments roughly correspond to what React calls "contexts" - shared state between the components of a single hierarchy.

I did not want to reuse overloaded terms like "state", "context", "store" and the like, so I choose the word "environment". An environment can be any object and is determined by the topmost call to the renderer.

For this website, we use instances of the [WebsiteEnvironment](../environment.ts) class, with their useful shared data that allows us to do things like (see the README in [`../translation`](../translation) for more details):
```
const _ = env.gettext.bindToBundle('core')

c.html('button',
  ...
  title: _('sidebar.button.collapse')
  ...
)
```

Whenever the environment's language is updated (i.e. whenever `env.changeLanguage(...)` resolves), all components bound to `_` observables get updated without any intermediate components getting rerendered.

## Static rendering

The [`renderToString`](./static_render.ts) function allows us to take a component and environment and output a string. This is the static server-side rendering. It is the simplest example of how everything comes together, so it makes sense to study the function before delving into reactivity.

## Re-rendering

Once we have a component, it has its `state$` property, and we can use it to extract the state and perform some action. This is how reactivity works:

1. An abstract `Node` type must be chosen, which will be the rendering target. An [`INodeManipulator`](./types.ts) interface must be implemented for it.

    The manipulator takes care of the low-level primitive operations of rendering - creating a node, updating some property of a node, adding a child node and so forth.

    We have implemented a [`DomManipulator`](../../client/core/dom/manipulator.ts) in the core bundle and a [`MirrorDomManipulator`](../../testing/unit/mirror_dom.ts) for our unit tests. The latter simply recreates the same virtual DOM as the source HtmlComponent.

2. Once we have a manipulator, we can instantiate a [`RenderingManager`](./manager.ts). This manager outsources some operations to the [`Renderer`](./renderer/renderer.ts) subclasses [`XmlRenderer`](./renderer/xml.ts) and [`FactoryRenderer`](./renderer/factory.ts).

    The aforementioned files have a lot of comments (see e.g. `RenderingManager`'s `#initializeRenderer` method or `FactoryRenderer`'s `rerender` method) since there are a lot of minutiae. Some subtleties even have dedicated tests in [`./test_manager.ts`](./test_manager.ts) numbered as `BF7` ("bugfix test 7").

    What matters here is that once we have a manager instance, we can use
    ```
    const node = manager.render(component)
    ```
    and any state updates of the component will be reflected by the manager.
