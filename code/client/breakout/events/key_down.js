import GameState from '../enums/game_state.js'

export default function onKeyDown (key, subject) {
  const { eventLoop, eventLoopSubscriptions } = subject.value
  const halfWidth = subject.value.width / 2 - subject.value.paddleWidth

  if (key === ' ') {
    switch (subject.value.state) {
      case GameState.UNSTARTED:
        subject.update({ state: GameState.RUNNING })
        break

      case GameState.RUNNING:
        subject.update({ state: GameState.PAUSED })
        break

      case GameState.PAUSED:
        subject.update({ state: GameState.RUNNING })
        break

      case GameState.COMPLETED:
        subject.update({ state: GameState.UNSTARTED })
        break
    }
  }

  if (key === 'ArrowLeft' && !eventLoopSubscriptions.has('paddleLeft')) {
    eventLoopSubscriptions.set(
      'paddleLeft',
      eventLoop.subscribe(function (period) {
        const oldX = subject.value.paddleX
        const delta = period / 60

        if (subject.value.state === GameState.RUNNING) {
          if (oldX - delta >= -halfWidth) {
            subject.update({ paddleX: oldX - delta })
          } else if (oldX - delta !== -halfWidth) {
            subject.update({ paddleX: -halfWidth })
          }
        }
      })
    )
  }

  if (key === 'ArrowRight' && !eventLoopSubscriptions.has('paddleRight')) {
    eventLoopSubscriptions.set(
      'paddleRight',
      eventLoop.subscribe(function (period) {
        const oldX = subject.value.paddleX
        const delta = period / 60

        if (subject.value.state === GameState.RUNNING) {
          if (oldX + delta <= halfWidth) {
            subject.update({ paddleX: oldX + delta })
          } else if (oldX + delta !== halfWidth) {
            subject.update({ paddleX: halfWidth })
          }
        }
      })
    )
  }
}
