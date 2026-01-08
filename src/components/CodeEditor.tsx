import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

declare global {
  interface Window {
    monaco: any
    require: any
  }
}

interface Section {
  id: string
  title: string
  file: string
  code?: string
}

interface Challenge {
  id: string
  title: string
  starter?: string
  statement?: string
  tests?: string
  sections?: Section[]
}

interface CourseMeta {
  id: string
  title: string
  description?: string
  difficulty?: string
  challenges?: Challenge[]
}

interface CodeEditorProps {
  courseId: string
  courseMeta: CourseMeta | null
  selectedChallenge: Challenge | null
  selectedSection: Section | null
  monacoLoaded: boolean
  onSwitchToContent: () => void
}

const CodeEditor = ({
  courseId,
  courseMeta,
  selectedChallenge,
  selectedSection,
  monacoLoaded,
  onSwitchToContent
}: CodeEditorProps) => {
  const navigate = useNavigate()
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)
  const [output, setOutput] = useState('')
  const [debugOutput, setDebugOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const [status, setStatus] = useState('Ready')
  const [pyodide, setPyodide] = useState<any>(null)

  // Initialize Monaco editor
  useEffect(() => {
    if (monacoLoaded && editorRef.current && !monacoRef.current) {
      monacoRef.current = window.monaco.editor.create(editorRef.current, {
        value: '# Write your Python code here\nprint("Hello, Algorithm!")\n\n# Click on a section to load code',
        language: 'python',
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        wordWrap: 'on'
      })
    }

    return () => {
      if (monacoRef.current) {
        monacoRef.current.dispose()
        monacoRef.current = null
      }
    }
  }, [monacoLoaded])

  // Load section-specific code when section changes
  useEffect(() => {
    const loadSectionCode = async () => {
      if (!selectedSection || !monacoRef.current) return

      if (selectedSection.code) {
        const cid = courseMeta?.id || courseId
        const codePathClean = selectedSection.code.replace(/^\/+/, '')
        const codePath = selectedSection.code.startsWith('/') 
          ? selectedSection.code 
          : `/courses/${cid}/${codePathClean}`
        
        try {
          const codeResp = await fetch(codePath)
          if (codeResp.ok) {
            const codeText = await codeResp.text()
            monacoRef.current.setValue(codeText)
            console.log('Loaded section-specific code:', codePath)
          } else {
            console.log('Section code file not found:', codePath)
          }
        } catch (err) {
          console.log('Error loading section code:', err)
        }
      }
    }

    loadSectionCode()
  }, [selectedSection, courseMeta, courseId])

  // Load Pyodide
  useEffect(() => {
    if (!pyodide) {
      loadPyodide()
    }
  }, [pyodide])

  const loadPyodide = async () => {
    setStatus('Loading Python...')
    try {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js'
      script.async = true
      script.onload = async () => {
        const pyodideInstance = await (window as any).loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
        })
        setPyodide(pyodideInstance)
        setStatus('Ready')
      }
      document.body.appendChild(script)
    } catch (error) {
      setStatus('Error loading Python')
      console.error('Failed to load Pyodide:', error)
    }
  }

  const handleRunCode = async () => {
    if (!pyodide) {
      setOutput('Python is still loading. Please wait...')
      return
    }

    if (!monacoRef.current) {
      setOutput('Editor not ready')
      return
    }

    setLoading(true)
    setStatus('Running...')
    setOutput('Executing code...\n')
    
    const code = monacoRef.current.getValue()

    try {
      await pyodide.runPythonAsync(`
import sys
from io import StringIO
sys.stdout = StringIO()
      `)

      await pyodide.runPythonAsync(code)

      const stdout = await pyodide.runPythonAsync('sys.stdout.getvalue()')
      setOutput(stdout || 'Code executed successfully (no output)')
      setStatus('Success')
    } catch (error: any) {
      setOutput(`Error:\n${error.message || error}`)
      setStatus('Error')
    } finally {
      setLoading(false)
    }
  }

  const handleDebug = () => {
    setShowDebug(!showDebug)
    if (!showDebug && monacoRef.current) {
      const code = monacoRef.current.getValue()
      const lines = code.split('\n')
      let debugInfo = 'Debug Information:\n\n'
      debugInfo += `Total Lines: ${lines.length}\n`
      debugInfo += `Non-empty Lines: ${lines.filter((l: string) => l.trim()).length}\n`
      setDebugOutput(debugInfo)
    }
  }

  const handleClear = () => {
    setOutput('')
    setDebugOutput('')
    setShowDebug(false)
  }

  const handleSave = () => {
    if (monacoRef.current) {
      const code = monacoRef.current.getValue()
      const blob = new Blob([code], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedChallenge?.id || 'code'}.py`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleRunTests = async () => {
    if (!pyodide) {
      setOutput('Python is still loading. Please wait...')
      return
    }

    if (!monacoRef.current || !selectedChallenge?.tests) {
      setOutput('No tests available')
      return
    }

    setStatus('Running Tests')
    setOutput('Preparing tests...')

    try {
      const userCode = monacoRef.current.getValue()
      await pyodide.runPythonAsync(`\nimport sys\nfrom io import StringIO\nsys.stdout = StringIO()\n`)
      await pyodide.runPythonAsync(userCode)

      const cid = courseMeta?.id || courseId
      const testsPathClean = selectedChallenge.tests.replace(/^\/+/, '')
      const testsFetchPath = selectedChallenge.tests.startsWith('/') 
        ? selectedChallenge.tests 
        : `/courses/${cid}/${testsPathClean}`
      
      const resp = await fetch(testsFetchPath)
      if (!resp.ok) throw new Error('Failed to fetch tests')
      const testsText = await resp.text()

      await pyodide.runPythonAsync(testsText)

      // Try common function names in order
      const tryRunTests = `
try:
    func_names = ['knapsack_recursive', 'knapsack_memo', 'knapsack_dp', 'knapsack_optimized', 'knapsack']
    func = None
    for name in func_names:
        if name in globals():
            func = globals()[name]
            break
    
    if func:
        results = run_tests(func)
        print("TEST_RESULTS_START")
        import json
        print(json.dumps(results))
        print("TEST_RESULTS_END")
    else:
        print("ERROR: No knapsack function found. Define one of: " + ", ".join(func_names))
except Exception as e:
    print(f"ERROR: {str(e)}")
`
      await pyodide.runPythonAsync(tryRunTests)
      const output = await pyodide.runPythonAsync('sys.stdout.getvalue()')
      
      // Parse the output
      if (output.includes('TEST_RESULTS_START')) {
        const start = output.indexOf('TEST_RESULTS_START') + 18
        const end = output.indexOf('TEST_RESULTS_END')
        const resultsJson = output.substring(start, end).trim()
        const results = JSON.parse(resultsJson)
        
        // Format results nicely
        let formatted = '═══════════════════════════════════════════════════════\n'
        formatted += '                    TEST RESULTS\n'
        formatted += '═══════════════════════════════════════════════════════\n\n'
        
        const passed = results.filter((r: any) => r.passed).length
        const total = results.length
        
        results.forEach((r: any) => {
          const status = r.passed ? '✓ PASS' : '✗ FAIL'
          formatted += `Test ${r.test_num}: ${status}\n`
          formatted += `  ${r.description}\n`
          formatted += `  Capacity: ${r.capacity}, Weights: [${r.weights}], Values: [${r.values}]\n`
          formatted += `  Expected: ${r.expected}, Actual: ${r.actual}\n\n`
        })
        
        formatted += '═══════════════════════════════════════════════════════\n'
        formatted += `SUMMARY: ${passed}/${total} tests passed\n`
        formatted += '═══════════════════════════════════════════════════════'
        
        setOutput(formatted)
        setStatus(passed === total ? 'Tests Complete ✓' : 'Tests Complete')
      } else {
        setOutput(output)
        setStatus('Error')
      }
    } catch (err: any) {
      console.error(err)
      setOutput(`Test run failed:\n${err.message || err}`)
      setStatus('Error')
    }
  }

  return (
    <>
      {/* Sidebar - collapsed version */}
      <aside className="course-sidebar collapsed">
        <div className="sidebar-header">
          <div className="course-info"></div>
          <button 
            className="collapse-btn"
            onClick={onSwitchToContent}
            title="Show Content"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </aside>

      {/* Main Editor */}
      <main className="course-main">
        <div className="content-header">
          <div className="breadcrumb">
            <button onClick={() => navigate('/dashboard')}>
              <i className="fas fa-home"></i> Dashboard
            </button>
            <i className="fas fa-chevron-right"></i>
            <span>{courseMeta?.title || 'Course'}</span>
            {selectedChallenge && (
              <>
                <i className="fas fa-chevron-right"></i>
                <span>{selectedChallenge.title}</span>
              </>
            )}
          </div>
          
          <div className="view-tabs">
            <button onClick={onSwitchToContent}>
              <i className="fas fa-book"></i> Content
            </button>
            <button className="active">
              <i className="fas fa-code"></i> Code Editor
            </button>
          </div>

          <div className="status-info">
            <span className={`status ${status.toLowerCase()}`}>
              {status}
            </span>
          </div>
        </div>

        <div className="content-area">
          <div className="editor-view">
            <div className="editor-toolbar">
              <button className="btn-primary" onClick={handleRunCode} disabled={loading}>
                <i className="fas fa-play"></i> {loading ? 'Running...' : 'Run Code'}
              </button>
              <button className="btn-secondary" onClick={handleDebug}>
                <i className="fas fa-bug"></i> Debug
              </button>
              <button className="btn-secondary" onClick={handleClear}>
                <i className="fas fa-eraser"></i> Clear
              </button>
              <button className="btn-secondary" onClick={handleSave}>
                <i className="fas fa-save"></i> Save
              </button>
              <button 
                className="btn-success" 
                onClick={handleRunTests}
                disabled={!selectedChallenge?.tests}
              >
                <i className="fas fa-check"></i> Run Tests
              </button>
            </div>
            
            <div className="editor-workspace">
              <div className="editor-panel">
                <div ref={editorRef} className="monaco-editor"></div>
              </div>
              <div className="output-panel">
                <h4><i className="fas fa-terminal"></i> Output</h4>
                <pre className="output">{output || 'Output will appear here...'}</pre>
                {showDebug && (
                  <>
                    <h4><i className="fas fa-bug"></i> Debug</h4>
                    <pre className="debug">{debugOutput}</pre>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default CodeEditor
