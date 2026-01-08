import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

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

interface CourseViewerProps {
  courseId: string
  challengeId?: string
  sectionId?: string
  courseMeta: CourseMeta | null
  onCourseMetaLoaded: (meta: CourseMeta) => void
  onSectionSelected: (section: Section) => void
  onChallengeSelected: (challenge: Challenge) => void
  onSwitchToEditor: () => void
}

const CourseViewer = ({
  courseId,
  challengeId,
  sectionId,
  courseMeta,
  onCourseMetaLoaded,
  onSectionSelected,
  onChallengeSelected,
  onSwitchToEditor
}: CourseViewerProps) => {
  const navigate = useNavigate()
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [sectionContent, setSectionContent] = useState<string>('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [status, setStatus] = useState('Ready')

  // Load course metadata
  useEffect(() => {
    if (courseMeta) return

    fetch(`/courses/${courseId}/course.json`).then(r => {
      if (r.ok) return r.json()
      return null
    }).then((meta) => {
      if (meta) {
        onCourseMetaLoaded(meta)
      }
    }).catch(() => {})
  }, [courseId, courseMeta, onCourseMetaLoaded])

  // Load challenge/section from URL parameters
  useEffect(() => {
    if (!courseMeta) return
    
    if (challengeId && courseMeta.challenges) {
      const challenge = courseMeta.challenges.find((ch: Challenge) => ch.id === challengeId)
      if (challenge) {
        setSelectedChallenge(challenge)
        onChallengeSelected(challenge)
        
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
      if (!resp.ok) {
        throw new Error(`Failed to load section: ${resp.status}`)
      }
      const txt = await resp.text()
      setSelectedSection(section)
      setSectionContent(txt)
      onSectionSelected(section)
      
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
    onChallengeSelected(ch)
    
    if (ch.sections && ch.sections.length > 0) {
      const firstSection = ch.sections[0]
      await loadSectionContent(firstSection.file, firstSection)
      navigate(`/course/${courseId}/${ch.id}/${firstSection.id}`)
    } else {
      navigate(`/course/${courseId}/${ch.id}`)
    }
  }

  return (
    <>
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
            <button className="active">
              <i className="fas fa-book"></i> Content
            </button>
            <button 
              onClick={onSwitchToEditor}
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
          <div className="content-viewer">
            {sectionContent ? (
              <div className="markdown-wrapper">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '')
                      const language = match ? match[1] : ''
                      
                      return !inline && language ? (
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={language}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
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
        </div>
      </main>
    </>
  )
}

export default CourseViewer
