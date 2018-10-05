import { CoolError } from '../../common/errors.mjs'
import { c } from '../../common/rendering/component.mjs'

import dispatcher from '../core/render_dispatcher.mjs'
import { aspectRatioPage, aspectRatioBox } from '../core/components/aspect_ratio_page.mjs'

import { Vector, Rect } from './support/geometry.mjs'
import transforms from './transforms.mjs'

export class CanvasError extends CoolError {}
export class CanvasAlreadyRegisteredError extends CanvasError {}

const MIN_CANVAS_SIDE = 250
const MAX_CANVAS_SIDE = 500
const INNER_CANVAS_SIDE = MAX_CANVAS_SIDE

const INITIAL_RECT = new Rect(
  new Vector(0, 0),
  new Vector(1, 0),
  new Vector(1, 1),
  new Vector(0, 1)
)

function draw (ctx, rect, transformList, iteration = 1) {
  if (Math.min(rect.width, rect.height) < 0.015) {
    ctx.fillStyle = 'black'

    // Scaling factor
    const s = INNER_CANVAS_SIDE

    ctx.save()
    ctx.beginPath()
    ctx.rotate(rect.positiveAngle)
    ctx.rect(
      s * rect.bl.x,
      s * (1 - rect.bl.y - rect.height),
      s * rect.width,
      s * rect.height
    )

    ctx.fill()
    ctx.restore()
  } else {
    for (const transform of transformList) {
      draw(ctx, transform.transformRect(rect), transformList, iteration + 1)
    }
  }
}

function initCanvas (canvas) {
  var ctx = canvas.getContext('2d')
  draw(ctx, INITIAL_RECT, transforms[0].transformList)
}

let canvas = null

dispatcher.observables.create.subscribe({
  next (node) {
    if (node.component.type === aifsCanvas) {
      if (canvas) {
        throw new CanvasAlreadyRegisteredError('There is already a registered canvas')
      }

      canvas = node.element
      initCanvas(canvas)
    }
  }
})

dispatcher.observables.destroy.subscribe({
  next (node) {
    if (node.component.type === aifsCanvas) {
      canvas = null
    }
  }
})

function aifsCanvas () {
  return c('canvas', {
    class: 'aifs-canvas',
    width: String(INNER_CANVAS_SIDE),
    height: String(INNER_CANVAS_SIDE)
  })
}

export default function playgroundAIFS () {
  return c(aspectRatioPage, { class: 'page playground-aifs-page' },
    c('div', { class: 'section' },
      c('h1', { class: 'section-title', text: 'Affine iterated function systems visualizations' }),
      c('p', {
        class: 'aifs-subtitle',
        text: 'Click through the samples below. You will soon be able to enter the desired affine transformations manually.'
      })
    ),

    c(aspectRatioBox, {
      ratio: 1,
      bottomMargin: 85,
      minHeight: MIN_CANVAS_SIDE,
      maxHeight: MAX_CANVAS_SIDE,
      item: c('div', { class: 'aifs-canvas-wrapper' },
        c(aifsCanvas)
      )
    }),

    c(
      'div',
      { class: 'aifs-transforms' },
      ...transforms.map(transform => c('button', {
        class: 'aifs-transform',
        text: transform.name,
        click () {
          var ctx = canvas.getContext('2d')
          ctx.clearRect(0, 0, INNER_CANVAS_SIDE, INNER_CANVAS_SIDE)
          draw(ctx, INITIAL_RECT, transform.transformList)
        }
      }))
    )
  )
}
