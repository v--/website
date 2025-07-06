import { DEFAULT_GAME_STATE, KEY_CONTROL, KEY_DEBUG, KEY_LEFT_SECONDARY, KEY_RESET, KEY_RIGHT_SECONDARY } from './constants.ts'
import { type IGameState, type UpdateGameState } from './types.ts'
import { type StateStore } from '../../common/support/state_store.ts'
import { type ClientWebsiteEnvironment } from '../core/environment.ts'

export interface IEventParams<EventT extends Event> {
  state: IGameState
  update: UpdateGameState
  env: ClientWebsiteEnvironment
  event: EventT
}

export function getEventParams<EventT extends Event>(store: StateStore<IGameState>, env: ClientWebsiteEnvironment, event: EventT): IEventParams<EventT> {
  return {
    state: store.getCombinedState(),
    update: store.update,
    env, event,
  }
}

function toggleStatus({ state, update }: IEventParams<Event>) {
  switch (state.phase) {
    case 'game_over':
    case 'completed':
      update(DEFAULT_GAME_STATE)
      break

    case 'unstarted':
    case 'paused':
      update({ phase: 'running' })
      break

    case 'running':
      update({ phase: 'paused' })
      break
  }
}

function tryReset({ env, update }: IEventParams<Event>) {
  const message = env.gettext.plain({ bundleId: 'breakout', key: 'control.reset.confirmation' })

  if (window.confirm(message)) {
    update(DEFAULT_GAME_STATE)
  }
}

export function handleKeyDown({ event, update }: IEventParams<KeyboardEvent>) {
  switch (event.key) {
    case KEY_LEFT_SECONDARY:
    case 'ArrowLeft':
      if (!event.repeat) {
        update({ paddleDirection: -1 })
      }

      break

    case KEY_RIGHT_SECONDARY:
    case 'ArrowRight':
      if (!event.repeat) {
        update({ paddleDirection: 1 })
      }

      break
  }
}

export function handleKeyUp(params: IEventParams<KeyboardEvent>) {
  const { state, event, update } = params

  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
    return
  }

  switch (event.key) {
    case KEY_CONTROL:
      toggleStatus(params)
      break

    case KEY_RESET:
      tryReset(params)
      break

    case KEY_DEBUG:
      update({ debug: !state.debug })
      break

    case KEY_LEFT_SECONDARY:
    case 'ArrowLeft':
      if (state.paddleDirection === -1) {
        update({ paddleDirection: 0 })
      }

      break

    case KEY_RIGHT_SECONDARY:
    case 'ArrowRight':
      if (state.paddleDirection === 1) {
        update({ paddleDirection: 0 })
      }

      break
  }
}

export function handleResetButton(params: IEventParams<MouseEvent>) {
  tryReset(params)
}

export function handleStageClick(params: IEventParams<MouseEvent>) {
  toggleStatus(params)
}

export function handleLeftButtonDown({ state, update }: IEventParams<MouseEvent>) {
  if (state.phase === 'running') {
    update({ paddleDirection: -1 })
  }
}

export function handleLeftButtonUp({ state, update }: IEventParams<MouseEvent>) {
  if (state.paddleDirection === -1) {
    update({ paddleDirection: 0 })
  }
}

export function handleRightButtonDown({ state, update }: IEventParams<MouseEvent>) {
  if (state.phase === 'running') {
    update({ paddleDirection: 1 })
  }
}

export function handleRightButtonUp({ state, update }: IEventParams<MouseEvent>) {
  if (state.paddleDirection === 1) {
    update({ paddleDirection: 0 })
  }
}
