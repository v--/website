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

async function toggleStatus({ state, update }: IEventParams<Event>) {
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

async function tryReset({ env, update }: IEventParams<Event>) {
  const message = await env.gettext({ bundleId: 'breakout', key: 'control.reset.confirmation' })

  if (window.confirm(message)) {
    update(DEFAULT_GAME_STATE)
  }
}

export async function handleKeyDown({ event, update }: IEventParams<KeyboardEvent>) {
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

export async function handleKeyUp(params: IEventParams<KeyboardEvent>) {
  const { state, event, update } = params

  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
    return
  }

  switch (event.key) {
    case KEY_CONTROL:
      await toggleStatus(params)
      break

    case KEY_RESET:
      await tryReset(params)
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

export async function handleResetButton(params: IEventParams<MouseEvent>) {
  await tryReset(params)
}

export async function handleStageClick(params: IEventParams<MouseEvent>) {
  await toggleStatus(params)
}

export async function handleLeftButtonDown({ state, update }: IEventParams<MouseEvent>) {
  if (state.phase === 'running') {
    update({ paddleDirection: -1 })
  }
}

export async function handleLeftButtonUp({ state, update }: IEventParams<MouseEvent>) {
  if (state.paddleDirection === -1) {
    update({ paddleDirection: 0 })
  }
}

export async function handleRightButtonDown({ state, update }: IEventParams<MouseEvent>) {
  if (state.phase === 'running') {
    update({ paddleDirection: 1 })
  }
}

export async function handleRightButtonUp({ state, update }: IEventParams<MouseEvent>) {
  if (state.paddleDirection === 1) {
    update({ paddleDirection: 0 })
  }
}
