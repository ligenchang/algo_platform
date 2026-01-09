import { useEffect, useState } from 'react'

declare global {
  interface Window {
    monaco?: any
    require?: any
  }
}

export default function useMonaco() {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    const ensureMonaco = async () => {
      try {
        if (window.monaco) {
          if (!cancelled) setLoaded(true)
          return
        }

        if (!document.querySelector('script[src*="monaco-editor/0.45.0/min/vs/loader.min.js"]')) {
          const script = document.createElement('script')
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/loader.min.js'
          script.async = true
          script.onload = () => {
            try {
              window.require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' } })
              window.require(['vs/editor/editor.main'], () => {
                if (!cancelled) setLoaded(true)
              })
            } catch (e) {
              if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)))
            }
          }
          script.onerror = () => {
            if (!cancelled) setError(new Error('Failed to load Monaco loader'))
          }
          document.head.appendChild(script)
        } else {
          // wait for require/monaco to be present
          const waitForMonaco = () => new Promise<void>((resolve) => {
            const check = () => (window.monaco ? resolve() : setTimeout(check, 50))
            check()
          })
          await waitForMonaco()
          if (!cancelled) setLoaded(true)
        }
      } catch (e: any) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)))
      }
    }

    void ensureMonaco()

    return () => { cancelled = true }
  }, [])

  return { loaded, error }
}
