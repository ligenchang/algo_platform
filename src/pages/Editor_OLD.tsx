import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import Navbar from '../components/Navbar'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
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
  const [viewMode, setViewMode] = useState<'content' | 'editor'>('content')
  const [monacoLoaded, setMonacoLoaded] = useState(false)
  const [courseMeta, setCourseMeta] = useState<CourseMeta | null>(null)
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sectionContent, setSectionContent] = useState<string>('')
  const [status, setStatus] = useState('Ready')
  
  // Editor specific state
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)
  const [output, setOutput] = useState('')
  const [debugOutput, setDebugOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const [pyodide, setPyodide] = useState<any>(null)

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
    document.head.appendChild(script)
  }, [navigate])

  return (
    <div className="course-page">
      <Navbar />
      <div className="course-layout">
        {viewMode === 'content' ? (
          <CourseViewer
            courseId={courseId || ''}
            challengeId={challengeId}
            sectionId={sectionId}
            courseMeta={courseMeta}
            onCourseMetaLoaded={setCourseMeta}
            onSectionSelected={setSelectedSection}
            onChallengeSelected={setSelectedChallenge}
            onSwitchToEditor={() => setViewMode('editor')}
          />
        ) : (
          <CodeEditor
            courseId={courseId || ''}
            courseMeta={courseMeta}
            selectedChallenge={selectedChallenge}
            selectedSection={selectedSection}
            monacoLoaded={monacoLoaded}
            onSwitchToContent={() => setViewMode('content')}
          />
        )}
      </div>
    </div>
  )
}

export default Editor
