import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import '../styles/Home.css'

const Home = () => {
  return (
    <div className="home-page">
      <Navbar />
      
      <section className="hero-section">
        <div className="hero-content">
          <h1>Master Algorithms & Data Structures</h1>
          <p>Learn with interactive code execution, built-in Python environment, and guided courses</p>
          <div className="hero-buttons">
            <Link to="/login" className="btn btn-gradient btn-large">
              <i className="fas fa-play"></i> Get Started Free
            </Link>
            <Link to="/pricing" className="btn btn-outline btn-large">
              <i className="fas fa-tag"></i> View Pricing
            </Link>
          </div>
          <div className="hero-features">
            <div className="hero-feature">
              <i className="fas fa-bolt"></i>
              <span>Instant Execution</span>
            </div>
            <div className="hero-feature">
              <i className="fas fa-graduation-cap"></i>
              <span>Structured Courses</span>
            </div>
            <div className="hero-feature">
              <i className="fas fa-infinity"></i>
              <span>Unlimited Pro</span>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Master Algorithms?</h2>
          <p>Join thousands of learners improving their skills</p>
          <Link to="/login" className="btn btn-gradient btn-large">
            <i className="fas fa-rocket"></i> Start Learning Now
          </Link>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Algorithm Learning Platform</h4>
            <p>Master data structures and algorithms with interactive coding</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/pricing">Pricing</Link></li>
              <li><Link to="/features">Features</Link></li>
              <li><Link to="/">Home</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Documentation</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Algorithm Learning Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Home
