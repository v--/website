import { InvalidElementError, MissingElementError } from './errors.ts'

export function togglePopover(id: string, state: boolean) {
  const popover = document.getElementById(id)

  if (popover === null) {
    throw new MissingElementError(`No element with id ${id}`)
  }

  if (popover instanceof HTMLElement) {
    if (state) {
      popover.showPopover()
    } else {
      popover.hidePopover()
    }
  }
}

export function toggleModalDialog(id: string, state: boolean) {
  const dialog = document.getElementById(id)

  if (dialog === null) {
    throw new MissingElementError(`No element with id ${id}`)
  }

  if (!(dialog instanceof HTMLDialogElement)) {
    throw new InvalidElementError(`Expected element with id ${id} to be a dialog, but got ${dialog.tagName}`)
  }

  if (state) {
    if (!dialog.open) {
      dialog.showModal()
    }
  } else {
    if (dialog.open) {
      dialog.close()
    }
  }
}
