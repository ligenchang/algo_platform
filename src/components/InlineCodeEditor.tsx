import { useEffect, useRef, useState } from 'react'
import './InlineCodeEditor.css'

interface InlineCodeEditorProps {
  code: string
  language?: string
  blockIndex: number
  monacoLoaded: boolean
  pyodideLoading?: boolean
  onRun?: (code: string) => Promise<string>
}

const InlineCodeEditor = ({ code, language = 'python', blockIndex, monacoLoaded, pyodideLoading = false, onRun }: InlineCodeEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const monacoEditorRef = useRef<any>(null)
  const [currentCode, setCurrentCode] = useState(code)
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (monacoLoaded && editorRef.current && !monacoEditorRef.current) {
      monacoEditorRef.current = window.monaco.editor.create(editorRef.current, {
        value: currentCode,
        language,
        theme: 'vs-dark',
        fontSize: 14,
        minimap: { enabled: false },
        lineNumbers: 'off',
        automaticLayout: true,
        scrollbar: { vertical: 'hidden', horizontal: 'hidden' }
      })
      monacoEditorRef.current.onDidChangeModelContent(() => {
        setCurrentCode(monacoEditorRef.current.getValue())
      })
      // Auto-resize height
      const updateHeight = () => {
        if (monacoEditorRef.current && editorRef.current) {
          const contentHeight = monacoEditorRef.current.getContentHeight()
          const height = Math.max(80, Math.min(contentHeight, 400)) // min 80px, max 400px
          editorRef.current.style.height = `${height}px`
          monacoEditorRef.current.layout()
        }
      }
      monacoEditorRef.current.onDidContentSizeChange(updateHeight)
      setTimeout(updateHeight, 50)
    }
    return () => {
      if (monacoEditorRef.current) {
        monacoEditorRef.current.dispose()
        monacoEditorRef.current = null
      }
    }
  }, [monacoLoaded])

  useEffect(() => {
    if (monacoEditorRef.current && currentCode !== monacoEditorRef.current.getValue()) {
      monacoEditorRef.current.setValue(currentCode)
    }
  }, [currentCode])

  const handleRun = async () => {
    if (!onRun) return
    setRunning(true)
    setOutput('Running...')
    try {
      const result = await onRun(currentCode)
      setOutput(result)
    } catch (err) {
      setOutput('Error running code')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="inline-code-block">
      <div className="inline-code-header">
        <span className="inline-code-lang">{language.toUpperCase()}</span>
        <button 
          className={`inline-code-run-btn${running || pyodideLoading ? ' running' : ''}`}
          onClick={handleRun}
          disabled={running || pyodideLoading}
        >
          {pyodideLoading ? <span className="spinner" /> : running ? <span className="spinner" /> : <i className="fas fa-play" />} {pyodideLoading ? 'Loading Python...' : running ? 'Running...' : 'Run'}
        </button>
      </div>
      {monacoLoaded ? (
        <div ref={editorRef} className="inline-monaco-editor" />
      ) : (
        <pre className="inline-code-fallback">{currentCode}</pre>
      )}
      {output && (
        <div className="inline-code-output">
          <pre>{output}</pre>
        </div>
      )}
    </div>
  )
}

export default InlineCodeEditor
