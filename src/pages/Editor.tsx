import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import Navbar from '../components/Navbar'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import InlineCodeEditor from '../components/InlineCodeEditor'
import '../styles/CoursePage.css'

declare global {
  interface Window {
    monaco: any
    require: any
    loadPyodide?: any
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

const Editor = () => {
  const { courseId, challengeId, sectionId } = useParams()
  const navigate = useNavigate()
  
  // View mode state
  const [viewMode, setViewMode] = useState<'content' | 'editor'>('content')
  
  // Shared state
  const [courseMeta, setCourseMeta] = useState<CourseMeta | null>(null)
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [status, setStatus] = useState('Ready')
  
  // Content viewer state
  const [sectionContent, setSectionContent] = useState<string>('')
  const [codeBlockOutputs, setCodeBlockOutputs] = useState<Record<number, string>>({})
  const [runningCodeBlock, setRunningCodeBlock] = useState<number | null>(null)
  
  // Editor state
  const [monacoLoaded, setMonacoLoaded] = useState(false)
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pyodide, setPyodide] = useState<any>(null)
  const [pyodideLoading, setPyodideLoading] = useState(true)

  // Load user, Monaco, and Pyodide
  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) {
      navigate('/login')
      return
    }

    // Load Monaco only if not already loaded
    if (!window.require) {
      if (!document.querySelector('script[src*="monaco-editor/0.45.0/min/vs/loader.min.js"]')) {
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/loader.min.js'
        script.async = true
        script.onload = () => {
          window.require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' } })
          window.require(['vs/editor/editor.main'], () => {
            setMonacoLoaded(true)
          })
        }
        document.head.appendChild(script)
      }
    } else {
      setMonacoLoaded(true)
    }

    // Load Pyodide globally only if not already loaded
    if (!window.loadPyodide) {
      if (!document.querySelector('script[src*="pyodide/v0.24.1/full/pyodide.js"]')) {
        const pyodideScript = document.createElement('script')
        pyodideScript.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js'
        pyodideScript.async = true
        pyodideScript.onload = async () => {
          const pyodideInstance = await window.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
          })
          setPyodide(pyodideInstance)
          setPyodideLoading(false)
        }
        pyodideScript.onerror = () => {
          setPyodideLoading(false)
        }
        document.head.appendChild(pyodideScript)
      }
    } else {
      // Already loaded
      (async () => {
        const pyodideInstance = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
        })
        setPyodide(pyodideInstance)
        setPyodideLoading(false)
      })()
    }
  }, [navigate])

  // Load course metadata
  useEffect(() => {
    if (courseMeta) return

    fetch(`/courses/${courseId}/course.json`).then(r => {
      if (r.ok) return r.json()
      return null
    }).then((meta) => {
      if (meta) setCourseMeta(meta)
    }).catch(() => {})
  }, [courseId, courseMeta])

  // Load challenge/section from URL
  useEffect(() => {
    if (!courseMeta) return
    
    if (challengeId && courseMeta.challenges) {
      const challenge = courseMeta.challenges.find((ch: Challenge) => ch.id === challengeId)
      if (challenge) {
        setSelectedChallenge(challenge)
        
        if (sectionId && challenge.sections) {
          const section = challenge.sections.find((sec: Section) => sec.id === sectionId)
          if (section) {
            loadSectionContent(section.file, section, false)
          }
        } else if (challenge.sections && challenge.sections.length > 0) {
          loadSectionContent(challenge.sections[0].file, challenge.sections[0], false)
        }
      }
    }
  }, [courseMeta, challengeId, sectionId])

  const loadSectionContent = async (filePath: string, section: Section, updateUrl: boolean = true) => {
    try {
      setStatus('Loading section...')
      const cid = courseMeta?.id || courseId
      const pathClean = filePath.replace(/^\/+/, '')
      const sectionPath = filePath.startsWith('/') ? filePath : `/courses/${cid}/${pathClean}`
      
      const resp = await fetch(sectionPath)
      if (!resp.ok) throw new Error(`Failed to load section: ${resp.status}`)
      
      const txt = await resp.text()
      setSelectedSection(section)
      setSectionContent(txt)
      
      if (updateUrl && selectedChallenge) {
        navigate(`/course/${courseId}/${selectedChallenge.id}/${section.id}`)
      }
      
      setStatus('Ready')
    } catch (err: any) {
      console.error('Error loading section:', err)
      setSectionContent(`# Error\n\nFailed to load section content.`)
      setStatus('Error')
    }
  }

  const selectChallenge = async (ch: Challenge) => {
    setSelectedChallenge(ch)
    
    if (ch.sections && ch.sections.length > 0) {
      const firstSection = ch.sections[0]
      await loadSectionContent(firstSection.file, firstSection)
      navigate(`/course/${courseId}/${ch.id}/${firstSection.id}`)
    } else {
      navigate(`/course/${courseId}/${ch.id}`)
    }
  }

  // Monaco editor setup
  useEffect(() => {
    if (!monacoLoaded || !selectedSection || viewMode !== 'editor') {
      // Clean up editor when switching away
      if (editorRef.current && viewMode !== 'editor') {
        editorRef.current.dispose()
        editorRef.current = null
        monacoRef.current = null
      }
      return
    }

    const container = document.getElementById('monaco-editor-container')
    if (!container) return

    // Always recreate editor when entering editor mode
    if (editorRef.current) {
      editorRef.current.dispose()
    }

    const editor = window.monaco.editor.create(container, {
      value: '# Write your code here\n',
      language: 'python',
      theme: 'vs-dark',
      minimap: { enabled: false },
      fontSize: 14,
      lineNumbers: 'on',
      automaticLayout: true
    })
    editorRef.current = editor
    monacoRef.current = editor.getModel()

    // Load section code
    if (selectedSection.code) {
      const cid = courseMeta?.id || courseId
      const codePathClean = selectedSection.code.replace(/^\/+/, '')
      const codePath = selectedSection.code.startsWith('/') 
        ? selectedSection.code 
        : `/courses/${cid}/${codePathClean}`
      
      fetch(codePath).then(r => r.ok ? r.text() : null).then(codeText => {
        if (codeText && monacoRef.current) {
          monacoRef.current.setValue(codeText)
        }
      }).catch(() => {})
    }

    // Cleanup on unmount or mode change
    return () => {
      if (editorRef.current) {
        editorRef.current.dispose()
        editorRef.current = null
        monacoRef.current = null
      }
    }
  }, [monacoLoaded, selectedSection, viewMode, courseMeta, courseId])

  // Run code from content code block
  const runCodeBlock = async (code: string, blockIndex: number) => {
    setRunningCodeBlock(blockIndex)
    setCodeBlockOutputs(prev => ({ ...prev, [blockIndex]: 'Running...' }))

    try {
      let pyodideInstance = pyodide

      if (!pyodideInstance) {
        setCodeBlockOutputs(prev => ({ ...prev, [blockIndex]: 'Loading Python...' }))
        // Only load script if window.loadPyodide is not present
        if (!window.loadPyodide) {
          if (!document.querySelector('script[src*="pyodide/v0.24.1/full/pyodide.js"]')) {
            const script = document.createElement('script')
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js'
            script.async = true
            await new Promise((resolve, reject) => {
              script.onload = resolve
              script.onerror = reject
              document.head.appendChild(script)
            })
          } else {
            // Wait for script to finish loading if already present
            await new Promise((resolve) => {
              const checkLoaded = () => {
                if (window.loadPyodide) resolve(true)
                else setTimeout(checkLoaded, 50)
              }
              checkLoaded()
            })
          }
        }
        pyodideInstance = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
        })
        setPyodide(pyodideInstance)
      }

      // Redirect stdout to capture print statements
      await pyodideInstance.runPythonAsync(`
import sys
from io import StringIO
sys.stdout = StringIO()
`)
      
      // Run the code
      try {
        await pyodideInstance.runPythonAsync(code)
      } catch (execError: any) {
        const partialOutput = await pyodideInstance.runPythonAsync('sys.stdout.getvalue()')
        throw new Error(partialOutput ? `${partialOutput}\n\n${execError.message}` : execError.message)
      }
      
      // Get the captured output
      const output = await pyodideInstance.runPythonAsync('sys.stdout.getvalue()')
      setCodeBlockOutputs(prev => ({ 
        ...prev, 
        [blockIndex]: output || 'Code executed successfully (no output)' 
      }))
    } catch (err: any) {
      setCodeBlockOutputs(prev => ({ 
        ...prev, 
        [blockIndex]: `Error: ${err.message}` 
      }))
    } finally {
      setRunningCodeBlock(null)
    }
  }

  // Run code in Monaco editor
  const runCode = async () => {
    if (!monacoRef.current) return
    
    setLoading(true)
    setStatus('Running...')
    setOutput('')

    try {
      let pyodideInstance = pyodide

      if (!pyodideInstance) {
        setStatus('Loading Python...')
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js'
        script.async = true
        await new Promise((resolve, reject) => {
          script.onload = resolve
          script.onerror = reject
          document.head.appendChild(script)
        })
        pyodideInstance = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
        })
        setPyodide(pyodideInstance)
      }

      const code = monacoRef.current.getValue()
      
      // Redirect stdout to capture print statements
      await pyodideInstance.runPythonAsync(`
import sys
from io import StringIO
sys.stdout = StringIO()
`)
      
      // Run the user code
      try {
        await pyodideInstance.runPythonAsync(code)
      } catch (execError: any) {
        // Get any output before the error
        const partialOutput = await pyodideInstance.runPythonAsync('sys.stdout.getvalue()')
        throw new Error(partialOutput ? `${partialOutput}\n\n${execError.message}` : execError.message)
      }
      
      // Get the captured output
      const output = await pyodideInstance.runPythonAsync('sys.stdout.getvalue()')
      setOutput(output || 'Code executed successfully (no output)')
      setStatus('Success')
    } catch (err: any) {
      setOutput(`Error: ${err.message}`)
      setStatus('Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="course-page">
      <Navbar />
      <div className="course-layout">
        {/* Unified Sidebar - Always Rendered */}
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
                {courseMeta?.challenges?.map((ch: Challenge, idx: number) => (
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
                        {ch.sections.map((sec: Section) => (
                          <button
                            key={sec.id}
                            className={`section-btn ${selectedSection?.id === sec.id ? 'active' : ''}`}
                            onClick={() => loadSectionContent(sec.file, sec)}
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

        {/* Main Content Area */}
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
              <button 
                className={viewMode === 'content' ? 'active' : ''}
                onClick={() => setViewMode('content')}
              >
                <i className="fas fa-book"></i> Content
              </button>
              <button 
                className={viewMode === 'editor' ? 'active' : ''}
                onClick={() => setViewMode('editor')}
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

          {/* Conditional Content Rendering */}
          <div className="content-area">
            {viewMode === 'content' ? (
              <div className="content-viewer">
                {sectionContent ? (
                  <div className="markdown-wrapper">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '')
                          const language = match ? match[1] : ''
                          const codeString = String(children).replace(/\n$/, '')
                          if (!inline && language === 'python') {
                            const blockIndex = node?.position?.start?.line || Math.random()
                            return (
                              <div className="code-block-wrapper">
                                {/* Monaco-based inline code editor */}
                                <InlineCodeEditor
                                  code={codeString}
                                  language={language}
                                  blockIndex={blockIndex}
                                  monacoLoaded={monacoLoaded}
                                  pyodideLoading={pyodideLoading}
                                  onRun={async (code) => {
                                    if (pyodideLoading || !pyodide) return 'Python is still loading. Please wait...'
                                    try {
                                      await pyodide.runPythonAsync(`import sys\nfrom io import StringIO\nsys.stdout = StringIO()`)
                                      await pyodide.runPythonAsync(code)
                                      const stdout = await pyodide.runPythonAsync('sys.stdout.getvalue()')
                                      return stdout || 'Code executed successfully (no output)'
                                    } catch (error) {
                                      return `Error: ${error instanceof Error ? error.message : String(error)}`
                                    }
                                  }}
                                />
                              </div>
                            )
                          }
                          
                          return !inline && language ? (
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={language}
                              PreTag="div"
                              {...props}
                            >
                              {codeString}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          )
                        }
                      }}
                    >
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
            ) : (
              <div className="editor-view">
                <div className="editor-toolbar">
                  <button 
                    className="btn btn-primary"
                    onClick={runCode}
                    disabled={loading || !monacoLoaded}
                  >
                    <i className="fas fa-play"></i> Run Code
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      if (monacoRef.current && selectedSection?.code) {
                        const cid = courseMeta?.id || courseId
                        const codePathClean = selectedSection.code.replace(/^\/+/, '')
                        const codePath = selectedSection.code.startsWith('/') 
                          ? selectedSection.code 
                          : `/courses/${cid}/${codePathClean}`
                        
                        fetch(codePath).then(r => r.ok ? r.text() : null).then(codeText => {
                          if (codeText && monacoRef.current) {
                            monacoRef.current.setValue(codeText)
                            setOutput('')
                            setStatus('Ready')
                          }
                        }).catch(() => {})
                      }
                    }}
                    disabled={loading || !monacoLoaded}
                  >
                    <i className="fas fa-undo"></i> Reset
                  </button>
                </div>

                <div className="editor-workspace">
                  <div className="editor-panel">
                    <div id="monaco-editor-container" style={{ width: '100%', height: '100%' }}></div>
                  </div>

                  <div className="output-panel">
                    <h4><i className="fas fa-terminal"></i> Output</h4>
                    <pre>{output || 'Run your code to see output here...'}</pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Editor
