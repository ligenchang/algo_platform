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
      folder: 'sorting'
    },
    {
      id: 'searching',
      title: 'Searching Algorithms',
      description: 'Learn binary search, linear search, and more',
      difficulty: 'Beginner',
      progress: 60,
      folder: 'searching'
    },
    {
      id: 'data_structures',
      title: 'Data Structures',
      description: 'Arrays, linked lists, stacks, queues, trees, graphs',
      difficulty: 'Intermediate',
      progress: 30,
      folder: 'data_structures'
    },
    {
      id: 'dynamic_programming',
      title: 'Dynamic Programming',
      description: 'Solve optimization problems with DP techniques',
      difficulty: 'Advanced',
      progress: 15,
      folder: 'dynamic_programming'
    },
    {
      id: 'graph_algorithms',
      title: 'Graph Algorithms',
      description: "BFS, DFS, Dijkstra, Kruskal, and Prim's algorithms",
      difficulty: 'Advanced',
      progress: 0,
      folder: 'graph_algorithms'
    }
  ]

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
              <h3>5</h3>
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
              <h3>{user.tier.toUpperCase()}</h3>
              <p>Current Plan</p>
            </div>
          </div>
        </div>

        <section className="courses-section">
          <h2>Your Courses</h2>
          <div className="courses-grid">
            {courses.map((course) => (
              <div key={course.id} className="course-card">
                <div className="course-header">
                  <h3>{course.title}</h3>
                  <span className={`difficulty ${course.difficulty.toLowerCase()}`}>
                    {course.difficulty}
                  </span>
                </div>
                <p>{course.description}</p>
                
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${course.progress}%` }}></div>
                </div>
                <p className="progress-text">{course.progress}% Complete</p>

                <Link to={`/course/${course.id}`} className="btn btn-outline">
                  <i className="fas fa-play"></i> {course.progress > 0 ? 'Continue' : 'Start'} Course
                </Link>
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
