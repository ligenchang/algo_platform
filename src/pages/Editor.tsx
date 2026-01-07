import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Navbar from '../components/Navbar'
import '../styles/CoursePage.css'

declare global {
  interface Window {
    monaco: any;
    require: any;
  }
}

const Editor = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)
  const [output, setOutput] = useState('')
  const [debugOutput, setDebugOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const [status, setStatus] = useState('Ready')
  const [pyodide, setPyodide] = useState<any>(null)

  const [courseMeta, setCourseMeta] = useState<any>(null)
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null)
  const [selectedSection, setSelectedSection] = useState<any>(null)
  const [sectionContent, setSectionContent] = useState<string>('')
  const [viewMode, setViewMode] = useState<'content' | 'editor'>('content')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [monacoLoaded, setMonacoLoaded] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) {
      navigate('/login')
      return
    }

    // Load Monaco Editor library
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/loader.min.js'
    script.async = true
    script.onload = () => {
      window.require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' } })
      window.require(['vs/editor/editor.main'], () => {
        setMonacoLoaded(true)
      })
    }
    document.body.appendChild(script)

    // Load Pyodide
    loadPyodide()

    // load course metadata
    const cid = courseId || 'dynamic_programming'
    fetch(`/courses/${cid}/course.json`).then((r) => {
      if (r.ok) return r.json()
      return null
    }).then((meta) => {
      if (meta) {
        setCourseMeta(meta)
      }
    }).catch(() => {})

    return () => {
      if (monacoRef.current) {
        monacoRef.current.dispose()
        monacoRef.current = null
      }
    }
  }, [navigate, courseId])

  // Initialize Monaco editor when Monaco library is loaded and view is in editor mode
  useEffect(() => {
    if (monacoLoaded && viewMode === 'editor' && editorRef.current && !monacoRef.current) {
      monacoRef.current = window.monaco.editor.create(editorRef.current, {
        value: '# Write your Python code here\nprint("Hello, Algorithm!")\n\n# Select a challenge and click "Code Editor" to load starter code',
        language: 'python',
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        wordWrap: 'on'
      })
    }
  }, [monacoLoaded, viewMode])

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
      // Capture stdout
      await pyodide.runPythonAsync(`
import sys
from io import StringIO
sys.stdout = StringIO()
      `)

      // Run user code
      await pyodide.runPythonAsync(code)

      // Get output
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
      debugInfo += `Characters: ${code.length}\n\n`
      debugInfo += 'Code Structure:\n'
      lines.forEach((line: string, idx: number) => {
        if (line.trim().startsWith('def ')) {
          debugInfo += `Line ${idx + 1}: Function definition - ${line.trim()}\n`
        } else if (line.trim().startsWith('class ')) {
          debugInfo += `Line ${idx + 1}: Class definition - ${line.trim()}\n`
        }
      })
      setDebugOutput(debugInfo)
    }
  }

  const handleAdvancedDebug = () => {
    if (!monacoRef.current) return
    
    const code = monacoRef.current.getValue()
    const lines = code.split('\n')
    
    let debugInfo = 'Advanced Debug Analysis:\n\n'
    debugInfo += '=== Code Metrics ===\n'
    debugInfo += `Total Lines: ${lines.length}\n`
    debugInfo += `Non-empty Lines: ${lines.filter((l: string) => l.trim()).length}\n`
    debugInfo += `Comment Lines: ${lines.filter((l: string) => l.trim().startsWith('#')).length}\n\n`
    
    debugInfo += '=== Complexity Analysis ===\n'
    const loops = code.match(/for |while /g)?.length || 0
    const conditionals = code.match(/if |elif |else:/g)?.length || 0
    debugInfo += `Loops: ${loops}\n`
    debugInfo += `Conditionals: ${conditionals}\n`
    debugInfo += `Estimated Complexity: O(n${loops > 1 ? '^' + loops : ''})\n\n`
    
    debugInfo += '=== Functions Detected ===\n'
    lines.forEach((line: string, idx: number) => {
      if (line.trim().startsWith('def ')) {
        debugInfo += `Line ${idx + 1}: ${line.trim()}\n`
      }
    })
    
    setDebugOutput(debugInfo)
    setShowDebug(true)
  }

  const handleClear = () => {
    setOutput('')
    setDebugOutput('')
    setShowDebug(false)
    setStatus('Ready')
  }

  const handleSave = () => {
    if (!monacoRef.current) return
    
    const code = monacoRef.current.getValue()
    const savedCode = {
      courseId,
      code,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem(`course_${courseId}_code`, JSON.stringify(savedCode))
    setStatus('Code saved!')
    setTimeout(() => setStatus('Ready'), 2000)
  }

  const handleDownload = () => {
    if (!monacoRef.current) return
    
    const code = monacoRef.current.getValue()
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `course_${courseId}_code.py`
    a.click()
    URL.revokeObjectURL(url)
  }

  const loadStarter = async (path: string) => {
    try {
      setStatus('Loading starter...')
      // normalize path: allow passing either absolute path or file relative to course folder
      const starterPath = path.startsWith('/') ? path : `/courses/${courseMeta?.id || courseId}/${path.replace(/^\/+/, '')}`
      const resp = await fetch(starterPath)
      if (!resp.ok) throw new Error('Failed to fetch starter')
      const text = await resp.text()
      if (monacoRef.current) {
        monacoRef.current.setValue(text)
        setStatus('Starter loaded')
        setTimeout(() => setStatus('Ready'), 1200)
      }
    } catch (err) {
      console.error(err)
      setStatus('Error loading starter')
    }
  }

  const loadSection = async (filePath: string, section: any) => {
    try {
      setStatus('Loading section...')
      const cid = courseMeta?.id || courseId
      const pathClean = filePath.replace(/^\/+/, '')
      const sectionPath = filePath.startsWith('/') ? filePath : `/courses/${cid}/${pathClean}`
      console.log('Loading section from:', sectionPath)
      const resp = await fetch(sectionPath)
      if (!resp.ok) {
        throw new Error(`Failed to load section: ${resp.status}`)
      }
      const txt = await resp.text()
      setSelectedSection(section)
      setSectionContent(txt)
      setViewMode('content')
      setStatus('Ready')
    } catch (err: any) {
      console.error('Error loading section:', err)
      setSectionContent(`# Error\n\nFailed to load section content.`)
      setViewMode('content')
      setStatus('Error')
    }
  }

  const selectChallenge = async (ch: any) => {
    setSelectedChallenge(ch)
    // Load first section if available
    if (ch.sections && ch.sections.length > 0) {
      await loadSection(ch.sections[0].file, ch.sections[0])
    }
  }

  const openEditor = async (ch: any) => {
    setSelectedChallenge(ch)
    setViewMode('editor')
    
    // Wait for Monaco to be ready before loading starter code
    const waitForMonaco = () => {
      return new Promise<void>((resolve) => {
        const checkMonaco = () => {
          if (window.monaco && editorRef.current) {
            if (!monacoRef.current) {
              monacoRef.current = window.monaco.editor.create(editorRef.current, {
                value: '# Loading starter code...',
                language: 'python',
                theme: 'vs-dark',
                automaticLayout: true,
                fontSize: 14,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                wordWrap: 'on'
              })
            }
            resolve()
          } else {
            setTimeout(checkMonaco, 50)
          }
        }
        checkMonaco()
      })
    }
    
    await waitForMonaco()
    
    // Load starter code
    const cid = courseMeta?.id || courseId
    if (ch.starter && monacoRef.current) {
      await loadStarter(`/courses/${cid}/${ch.starter}`)
    }
  }

  const handleRunTests = async (testsPath: string) => {
    if (!pyodide) {
      setOutput('Python is still loading. Please wait...')
      return
    }

    if (!monacoRef.current) {
      setOutput('Editor not ready')
      return
    }

    setStatus('Running Tests')
    setOutput('Preparing tests...')

    try {
      // Load user code into pyodide
      const userCode = monacoRef.current.getValue()
      await pyodide.runPythonAsync(`\nimport sys\nfrom io import StringIO\nsys.stdout = StringIO()\n`)
      await pyodide.runPythonAsync(userCode)

      // Fetch tests script text
      const testsPathClean = testsPath.replace(/^\/+/, '')
      const testsFetchPath = testsPath.startsWith('/') ? testsPath : `/courses/${courseMeta?.id || courseId}/${testsPathClean}`
      const resp = await fetch(testsFetchPath)
      if (!resp.ok) throw new Error('Failed to fetch tests')
      const testsText = await resp.text()

      // Evaluate tests script in pyodide namespace
      await pyodide.runPythonAsync(testsText)

      // Assume tests define run_tests function that takes the user's function
      // Get the user function object
      const getFn = await pyodide.runPythonAsync("''" + '\n' + 'knapsack_max = knapsack_max_value' + '\n' + "''")
      const results = await pyodide.runPythonAsync('run_tests(knapsack_max_value)')

      // Convert results to JS
      const jsResults = pyodide.toPy ? pyodide.toPy(results) : results
      // The result may already be a JS-compatible object
      setOutput(JSON.stringify(jsResults, null, 2))
      setStatus('Tests Complete')
    } catch (err: any) {
      console.error(err)
      setOutput(`Test run failed:\n${err.message || err}`)
      setStatus('Error')
    }
  }

  return (
    <div className="course-page">
      <Navbar />
      <div className="course-layout">
        {/* Sidebar */}
        <aside className={`course-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            <div className="course-info">
              {!sidebarCollapsed && (
                <>
                  <i className="fas fa-graduation-cap"></i>
                  <div className="course-title">
                    <h3>{courseMeta?.title || 'Course'}</h3>
                    <p>Interactive Learning</p>
                  </div>
                </>
              )}
            </div>
            <button 
              className="collapse-btn"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? 'Expand' : 'Collapse'}
            >
              <i className={`fas fa-chevron-${sidebarCollapsed ? 'right' : 'left'}`}></i>
            </button>
          </div>

          {!sidebarCollapsed && (
            <div className="sidebar-content">
              <div className="challenges-section">
                <h4>Course Content</h4>
                {courseMeta?.challenges?.map((ch: any, idx: number) => (
                  <div key={ch.id} className="challenge-item">
                    <button 
                      className={`challenge-btn ${selectedChallenge?.id === ch.id ? 'active' : ''}`}
                      onClick={() => selectChallenge(ch)}
                    >
                      <span className="challenge-num">{idx + 1}</span>
                      <span className="challenge-title">{ch.title}</span>
                      <i className={`fas fa-chevron-${selectedChallenge?.id === ch.id ? 'down' : 'right'}`}></i>
                    </button>
                    
                    {selectedChallenge?.id === ch.id && ch.sections && (
                      <div className="sections-list">
                        {ch.sections.map((sec: any) => (
                          <button
                            key={sec.id}
                            className={`section-btn ${selectedSection?.id === sec.id ? 'active' : ''}`}
                            onClick={() => loadSection(sec.file, sec)}
                          >
                            <i className={`fas fa-${selectedSection?.id === sec.id ? 'circle' : 'circle-o'}`}></i>
                            <span>{sec.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="course-main">
          {/* Header */}
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
              <button 
                className={viewMode === 'content' ? 'active' : ''}
                onClick={() => setViewMode('content')}
              >
                <i className="fas fa-book"></i> Content
              </button>
              <button 
                className={viewMode === 'editor' ? 'active' : ''}
                onClick={() => selectedChallenge && openEditor(selectedChallenge)}
                disabled={!selectedChallenge}
              >
                <i className="fas fa-code"></i> Code Editor
              </button>
            </div>

            <div className="status-info">
              <span className={`status ${status.toLowerCase()}`}>
                {status}
              </span>
            </div>
          </div>

          {/* Content Area */}
          <div className="content-area">
            {/* Content View */}
            <div className="content-viewer" style={{ display: viewMode === 'content' ? 'block' : 'none' }}>
              {sectionContent ? (
                <div className="markdown-wrapper">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {sectionContent}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="empty-state">
                  <i className="fas fa-book-open"></i>
                  <h2>Welcome to {courseMeta?.title || 'the Course'}</h2>
                  <p>Select a challenge from the sidebar to begin learning.</p>
                </div>
              )}
            </div>

            {/* Editor View */}
            <div className="editor-view" style={{ display: viewMode === 'editor' ? 'flex' : 'none' }}>
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
                  onClick={async () => {
                    if (selectedChallenge?.tests) {
                      const cid = courseMeta?.id || courseId
                      await handleRunTests(`/courses/${cid}/${selectedChallenge.tests}`)
                    }
                  }}
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
      </div>
    </div>
  )
}

export default Editor
