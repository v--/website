import { waitForElementById } from './misc.ts'

export async function togglePopover(id: string, state: boolean) {
  const popover = await waitForElementById(id)

  if (popover instanceof HTMLElement) {
    if (state) {
      popover.showPopover()
    } else {
      popover.hidePopover()
    }
  }
}

export async function toggleModalDialog(id: string, state: boolean) {
  const dialog = await waitForElementById(id)

  if (dialog instanceof HTMLDialogElement) {
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
}
