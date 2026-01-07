import { Link, useNavigate } from 'react-router-dom'
import '../styles/Navbar.css'

const Navbar = () => {
  const navigate = useNavigate()
  const isAuthenticated = !!localStorage.getItem('authToken')
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="nav-content">
        <Link to="/" className="nav-brand">
          <i className="fas fa-graduation-cap"></i>
          <span>Algorithm Learning Platform</span>
        </Link>
        
        <div className="nav-links">
          <Link to="/features">Features</Link>
          <Link to="/pricing">Pricing</Link>
          
          {isAuthenticated ? (
            <div className="nav-user">
              <span>Welcome, {user?.name}</span>
              <Link to="/dashboard" className="btn btn-outline">Dashboard</Link>
              <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-outline">
              <i className="fas fa-sign-in-alt"></i> Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
