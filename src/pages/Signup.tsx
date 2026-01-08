import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../styles/Login.css'

const Signup = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // In production, make API call to your backend
      // For demo, directly create mock user
      let data
      
      try {
        const response = await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password
          })
        })
        
        if (response.ok) {
          data = await response.json()
        } else {
          throw new Error('API not available')
        }
      } catch (apiError) {
        // Mock successful signup for demo (API not available)
        data = {
          success: true,
          token: 'demo_token_' + Math.random().toString(36).substr(2, 9),
          user: {
            id: Math.random().toString(36).substr(2, 9),
            name: formData.name,
            email: formData.email,
            isPro: false,
            plan: 'Free'
          }
        }
      }

      if (!data.success) {
        throw new Error(data.error || 'Signup failed')
      }

      // Store auth data
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Store intended plan if redirecting to pricing
      if (plan) {
        sessionStorage.setItem('intendedPlan', plan.charAt(0).toUpperCase() + plan.slice(1))
      }

      // Redirect based on params
      if (redirectTo === 'pricing') {
        navigate('/pricing')
      } else {
        navigate('/dashboard')
      }

    } catch (error: any) {
      setErrors({ form: error.message || 'Signup failed. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <Navbar />
      
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <i className="fas fa-graduation-cap"></i>
              <span>Algorithm Platform</span>
            </Link>
            <h1>Create Account</h1>
            {plan && (
              <p className="plan-notice">
                <i className="fas fa-crown"></i>
                Sign up to continue with {plan} plan
              </p>
            )}
            <p>Start your learning journey today</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {errors.form && (
              <div className="error-banner">
                <i className="fas fa-exclamation-circle"></i>
                {errors.form}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name">
                <i className="fas fa-user"></i> Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={errors.name ? 'error' : ''}
                disabled={loading}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <i className="fas fa-envelope"></i> Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className={errors.email ? 'error' : ''}
                disabled={loading}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <i className="fas fa-lock"></i> Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={errors.password ? 'error' : ''}
                disabled={loading}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                <i className="fas fa-lock"></i> Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={errors.confirmPassword ? 'error' : ''}
                disabled={loading}
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Creating Account...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i> Sign Up
                </>
              )}
            </button>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <div className="auth-footer">
              <p>
                Already have an account?{' '}
                <Link to={`/login${redirectTo ? `?redirect=${redirectTo}&plan=${plan}` : ''}`}>
                  Sign In
                </Link>
              </p>
            </div>

            <p className="terms-text">
              By signing up, you agree to our{' '}
              <Link to="/terms">Terms of Service</Link> and{' '}
              <Link to="/privacy">Privacy Policy</Link>
            </p>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Signup
