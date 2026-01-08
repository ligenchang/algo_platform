import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../styles/Login.css'

const Login = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('test123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Get redirect params
  const redirectTo = searchParams.get('redirect')
  const plan = searchParams.get('plan')

  useEffect(() => {
    // If already logged in, redirect
    if (localStorage.getItem('authToken')) {
      if (redirectTo === 'pricing' && plan) {
        navigate(`/pricing`)
      } else {
        navigate('/dashboard')
      }
    }
  }, [navigate, redirectTo, plan])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simulate login
    setTimeout(() => {
      if (email && password) {
        const user = {
          id: '1',
          name: email.split('@')[0],
          email,
          isPro: false,
          plan: 'Free'
        }
        localStorage.setItem('authToken', 'mock_token_' + Date.now())
        localStorage.setItem('user', JSON.stringify(user))
        
        // Store intended plan if redirecting to pricing
        if (plan) {
          sessionStorage.setItem('intendedPlan', plan.charAt(0).toUpperCase() + plan.slice(1))
        }
        
        setLoading(false)
        
        // Redirect based on params
        if (redirectTo === 'pricing') {
          navigate('/pricing')
        } else {
          navigate('/dashboard')
        }
      } else {
        setError('Please enter email and password')
        setLoading(false)
      }
    }, 500)
  }

  return (
    <div className="login-page">
      <Navbar />
      
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Sign In</h1>
            {plan && (
              <p className="plan-notice">
                <i className="fas fa-crown"></i>
                Sign in to continue with {plan} plan
              </p>
            )}
            <p>Access your algorithm learning platform</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <i className="fas fa-envelope"></i>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <i className="fas fa-lock"></i>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-gradient btn-large" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            <p>Demo credentials: test@example.com / test123</p>
            <p>
              Don't have an account?{' '}
              <Link to={`/signup${redirectTo ? `?redirect=${redirectTo}&plan=${plan}` : ''}`}>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Login
