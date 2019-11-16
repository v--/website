export function onKeyUp (subject, key) {
  const { paddleDirection } = subject.value

  if (key === 'ArrowLeft' && paddleDirection < 0) {
    subject.update({ paddleDirection: 0 })
  }

  if (key === 'ArrowRight' && paddleDirection > 0) {
    subject.update({ paddleDirection: 0 })
  }
}
