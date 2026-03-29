export function togglePopover(id: string, state: boolean) {
  const popover = document.getElementById(id)

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
