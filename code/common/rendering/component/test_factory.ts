import { describe, it } from 'node:test'

import { FactoryComponent } from './factory.ts'
import { HtmlComponent } from './html.ts'
import { assertEqualRepr } from '../../../testing/assertion.ts'
import { MockEnvironment } from '../../../testing/unit/mock_environment.ts'

describe('FactoryComponent class', function () {
  describe('evaluate method', function () {
    it('handles simple factories', async function () {
      interface IState {
        text: string
      }

      function factory({ text }: IState) {
        return new HtmlComponent('div', { text }, [])
      }

      const evaluated = await new FactoryComponent(factory, { text: 'text' }, []).evaluate({ text: 'text' }, new MockEnvironment())
      const expected = new HtmlComponent('div', { text: 'text' }, [])

      assertEqualRepr(evaluated, expected)
    })
  })
})
