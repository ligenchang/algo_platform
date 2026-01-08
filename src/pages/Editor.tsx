import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import CourseViewer from '../components/CourseViewer'
import CodeEditor from '../components/CodeEditor'
import '../styles/CoursePage.css'

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

const Editor = () => {
  const { courseId, challengeId, sectionId } = useParams()
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'content' | 'editor'>('content')
  const [monacoLoaded, setMonacoLoaded] = useState(false)
  const [courseMeta, setCourseMeta] = useState<CourseMeta | null>(null)
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)

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
