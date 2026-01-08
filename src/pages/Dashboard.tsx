import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import '../styles/Dashboard.css'

const Dashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      navigate('/login')
    } else {
      setUser(JSON.parse(userData))
    }
  }, [navigate])

  const courses = [
    {
      id: 'sorting',
      title: 'Sorting Algorithms',
      description: 'Master bubble, merge, quick, and heap sort',
      difficulty: 'Beginner',
      progress: 45,
      folder: 'sorting',
      isLocked: false
    },
    {
      id: 'searching',
      title: 'Searching Algorithms',
      description: 'Learn binary search, linear search, and more',
      difficulty: 'Beginner',
      progress: 60,
      folder: 'searching',
      isLocked: false
    },
    {
      id: 'data_structures',
      title: 'Data Structures',
      description: 'Arrays, linked lists, stacks, queues, trees, graphs',
      difficulty: 'Intermediate',
      progress: 30,
      folder: 'data_structures',
      isLocked: false
    },
    {
      id: 'dynamic_programming',
      title: 'Dynamic Programming',
      description: 'Solve optimization problems with DP techniques',
      difficulty: 'Advanced',
      progress: 15,
      folder: 'dynamic_programming',
      isLocked: false
    },
    {
      id: 'graph_algorithms',
      title: 'Graph Algorithms',
      description: "BFS, DFS, Dijkstra, Kruskal, and Prim's algorithms",
      difficulty: 'Advanced',
      progress: 0,
      folder: 'graph_algorithms',
      isLocked: !user?.isPro
    }
  ]

  const getCoursesCount = () => {
    const unlockedCourses = courses.filter(c => !c.isLocked).length
    return user?.isPro ? '50+' : unlockedCourses.toString()
  }

  const handleCourseClick = (course: any) => {
    if (course.isLocked) {
      if (window.confirm('This course is only available in Pro plan. Would you like to upgrade?')) {
        navigate('/pricing')
      }
    } else {
      navigate(`/course/${course.id}`)
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="dashboard-page">
      <Navbar />

      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome back, {user.name}!</h1>
          <p>Continue your learning journey</p>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-book"></i>
            </div>
            <div className="stat-content">
              <h3>{getCoursesCount()}</h3>
              <p>Courses Available</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-fire"></i>
            </div>
            <div className="stat-content">
              <h3>7</h3>
              <p>Days Streak</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-trophy"></i>
            </div>
            <div className="stat-content">
              <h3>2</h3>
              <p>Courses Completed</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-star"></i>
            </div>
            <div className="stat-content">
              <h3>{user?.isPro ? 'PRO' : 'FREE'}</h3>
              <p>Current Plan</p>
              {!user?.isPro && (
                <Link to="/pricing" className="upgrade-link">
                  <i className="fas fa-crown"></i> Upgrade
                </Link>
              )}
            </div>
          </div>
        </div>

        <section className="courses-section">
          <div className="courses-header">
            <h2>Your Courses</h2>
            {!user?.isPro && (
              <div className="pro-banner">
                <i className="fas fa-crown"></i>
                <span>Unlock 45+ more courses with Pro</span>
                <Link to="/pricing" className="btn btn-gradient btn-small">
                  Upgrade Now
                </Link>
              </div>
            )}
          </div>
          <div className="courses-grid">
            {courses.map((course) => (
              <div 
                key={course.id} 
                className={`course-card ${course.isLocked ? 'locked' : ''}`}
                onClick={() => course.isLocked && handleCourseClick(course)}
              >
                {course.isLocked && (
                  <div className="lock-overlay">
                    <i className="fas fa-lock"></i>
                    <span>Pro Only</span>
                  </div>
                )}
                <div className="course-header">
                  <h3>{course.title}</h3>
                  <span className={`difficulty ${course.difficulty.toLowerCase()}`}>
                    {course.difficulty}
                  </span>
                </div>
                <p>{course.description}</p>
                
                {!course.isLocked && (
                  <>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${course.progress}%` }}></div>
                    </div>
                    <p className="progress-text">{course.progress}% Complete</p>
                  </>
                )}

                {course.isLocked ? (
                  <button className="btn btn-outline" onClick={(e) => { e.stopPropagation(); handleCourseClick(course); }}>
                    <i className="fas fa-lock"></i> Unlock with Pro
                  </button>
                ) : (
                  <Link to={`/course/${course.id}`} className="btn btn-outline">
                    <i className="fas fa-play"></i> {course.progress > 0 ? 'Continue' : 'Start'} Course
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Algorithm Learning Platform</h4>
            <p>Master data structures and algorithms with interactive coding</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Dashboard
