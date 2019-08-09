export default function onKeyUp (key, subject) {
  const { eventLoopSubscriptions } = subject.value

  if (eventLoopSubscriptions.has('paddleLeft') && key === 'ArrowLeft') {
    eventLoopSubscriptions.get('paddleLeft').unsubscribe()
    eventLoopSubscriptions.delete('paddleLeft')
  }

  if (eventLoopSubscriptions.has('paddleRight') && key === 'ArrowRight') {
    eventLoopSubscriptions.get('paddleRight').unsubscribe()
    eventLoopSubscriptions.delete('paddleRight')
  }
}
