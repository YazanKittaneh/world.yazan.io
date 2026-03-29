export interface SwipeOptions {
  threshold?: number
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

export function useSwipe(options: SwipeOptions) {
  const threshold = options.threshold ?? 50

  let startX = 0
  let startY = 0
  let startTime = 0

  const onTouchStart = (e: TouchEvent) => {
    startX = e.touches[0].clientX
    startY = e.touches[0].clientY
    startTime = Date.now()
  }

  const onTouchEnd = (e: TouchEvent) => {
    const endX = e.changedTouches[0].clientX
    const endY = e.changedTouches[0].clientY
    const deltaX = endX - startX
    const deltaY = endY - startY
    const elapsed = Date.now() - startTime

    const isQuickSwipe = elapsed <= 300
    if (!isQuickSwipe) return

    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    const isHorizontal = absX > absY && absX > threshold
    if (isHorizontal) {
      if (deltaX > 0) {
        options.onSwipeRight?.()
      } else {
        options.onSwipeLeft?.()
      }
    } else if (absY > absX && absY > threshold) {
      if (deltaY > 0) {
        options.onSwipeDown?.()
      } else {
        options.onSwipeUp?.()
      }
    }
  }

  return {
    onTouchStart,
    onTouchEnd
  }
}
