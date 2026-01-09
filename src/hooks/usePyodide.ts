import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    loadPyodide?: any
  }
}

export default function usePyodide() {
  const pyodideRef = useRef<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    const ensurePyodide = async () => {
      try {
        if (pyodideRef.current) {
          setLoading(false)
          return
        }

        if (!window.loadPyodide) {
          if (!document.querySelector('script[src*="pyodide/v0.24.1/full/pyodide.js"]')) {
            const script = document.createElement('script')
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js'
            script.async = true
            await new Promise<void>((resolve, reject) => {
              script.onload = () => resolve()
              script.onerror = () => reject(new Error('Failed to load pyodide script'))
              document.head.appendChild(script)
            })
          } else {
            // wait until global is present
            await new Promise<void>((resolve) => {
              const check = () => (window.loadPyodide ? resolve() : setTimeout(check, 50))
              check()
            })
          }
        }

        const instance = await window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/' })
        if (cancelled) return
        pyodideRef.current = instance
        setLoading(false)
      } catch (e: any) {
        if (cancelled) return
        setError(e instanceof Error ? e : new Error(String(e)))
        setLoading(false)
      }
    }

    void ensurePyodide()

    return () => { cancelled = true }
  }, [])

  return { pyodide: pyodideRef.current, loading, error }
}
