import React from 'react'

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
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)

  return (
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
                  className={`challenge-btn ${challengeId === ch.id ? 'active' : ''}`}
                  onClick={() => onChallengeSelected(ch)}
                >
                  <span className="challenge-num">{idx + 1}</span>
                  <span className="challenge-title">{ch.title}</span>
                  <i className={`fas fa-chevron-${challengeId === ch.id ? 'down' : 'right'}`}></i>
                </button>
                {challengeId === ch.id && ch.sections && (
                  <div className="sections-list">
                    {ch.sections.map((sec: Section) => (
                      <button
                        key={sec.id}
                        className={`section-btn ${sectionId === sec.id ? 'active' : ''}`}
                        onClick={() => onSectionSelected(sec)}
                      >
                        <i className={`fas fa-${sectionId === sec.id ? 'circle' : 'circle-o'}`}></i>
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
  )
}

export default CourseViewer
