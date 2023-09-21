import {useEffect, useLayoutEffect, useRef} from 'react'

type Args = {
  onIntersect: () => void
  onExit?: () => void
  observerOptions?: IntersectionObserverInit
}

/**
 * Args: {onIntersect: () => void} -- react callback
 */
export function useFooterObserver({
  onIntersect,
  onExit,
  observerOptions,
}: Args) {
  // refer to: https://epicreact.dev/the-latest-ref-pattern-in-react/
  const onIntersectRef = useRef(onIntersect)
  const onExitRef = useRef(onExit)

  useLayoutEffect(() => {
    onIntersectRef.current = onIntersect
    onExitRef.current = onExit
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cb: IntersectionObserverCallback = entries => {
        if (entries?.[0]?.isIntersecting) {
          onIntersectRef.current()
        } else {
          onExitRef.current?.()
        }
      }
      const observer = new IntersectionObserver(cb, {
        root: null,
        rootMargin: '160px',
        threshold: 0.1,
        ...observerOptions,
      })

      let footer = document.getElementsByTagName('footer')[0]
      if (footer) {
        observer.observe(footer)
      }

      return () => {
        if (footer) {
          observer.unobserve(footer)
        }
      }
    }
  }, [])
}
