import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import '../styles/Features.css'

const Features = () => {
  const features = [
    {
      icon: 'fa-code',
      title: 'Interactive Code Editor',
      description: 'Monaco Editor powered by VS Code with IntelliSense, syntax highlighting, and auto-completion'
    },
    {
      icon: 'fa-bolt',
      title: 'Instant Python Execution',
      description: 'Run Python code directly in your browser with Pyodide - no server setup required'
    },
    {
      icon: 'fa-graduation-cap',
      title: 'Structured Courses',
      description: 'Follow comprehensive courses from beginner to advanced levels with starter code'
    },
    {
      icon: 'fa-bug',
      title: 'Advanced Debugging',
      description: 'Built-in debugger with breakpoints, variable inspection, and execution tracing'
    },
    {
      icon: 'fa-brain',
      title: 'AI Code Assistant',
      description: 'Get intelligent suggestions, explanations, and hints powered by AI (Pro+ feature)'
    },
    {
      icon: 'fa-share-nodes',
      title: 'Code Sharing',
      description: 'Share your code and solutions with peers. Collaborate and learn together'
    },
    {
      icon: 'fa-chart-line',
      title: 'Progress Analytics',
      description: 'Track your learning progress with detailed analytics and performance metrics'
    },
    {
      icon: 'fa-mobile',
      title: 'Mobile Ready',
      description: 'Learn anywhere with our responsive design. Perfect for on-the-go learning'
    }
  ]

  return (
    <div className="features-page">
      <Navbar />

      <section className="features-section">
        <h2 className="section-title">Powerful Features for Every Learner</h2>
        <p className="section-subtitle">Everything you need to master algorithms and data structures</p>
        
        <div className="features-grid">
          {features.map((feature, idx) => (
            <div key={idx} className="feature-card">
              <div className="feature-icon">
                <i className={`fas ${feature.icon}`}></i>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Get Started?</h2>
          <p>Choose a plan that fits your learning needs</p>
          <Link to="/pricing" className="btn btn-gradient btn-large">
            <i className="fas fa-check-circle"></i> View Pricing
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
        </div>
      </footer>
    </div>
  )
}

export default Features
