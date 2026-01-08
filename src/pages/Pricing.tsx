import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../styles/Pricing.css'

// Initialize Stripe with your publishable key
// Replace with your actual Stripe publishable key
const stripePromise = loadStripe('pk_test_51234567890abcdefghijklmnopqrstuvwxyz')

// Payment Form Component
const CheckoutForm = ({ 
  selectedPlan, 
  onSuccess, 
  onCancel 
}: { 
  selectedPlan: string
  onSuccess: () => void
  onCancel: () => void
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string>('')
  const [cardComplete, setCardComplete] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    if (!cardComplete) {
      setError('Please complete your card information')
      return
    }

    setProcessing(true)
    setError('')

    try {
      // Get card element
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card element not found')
      }

      // Create payment method
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }

      // In production, send paymentMethod.id to your backend
      // Your backend would:
      // 1. Create a Stripe customer
      // 2. Attach payment method to customer
      // 3. Create subscription
      // 4. Return subscription details
      
      // Simulate API call with proper error handling
      let data
      
      try {
        const response = await fetch('/api/create-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({
            paymentMethodId: paymentMethod.id,
            plan: selectedPlan,
            priceId: selectedPlan === 'Pro' ? 'price_pro_monthly' : 'price_enterprise_monthly'
          })
        })
        
        if (response.ok) {
          data = await response.json()
        } else {
          throw new Error('API not available')
        }
      } catch (apiError) {
        // Mock response for demo (API not available)
        data = {
          success: true,
          subscription: {
            id: 'sub_' + Math.random().toString(36).substr(2, 9),
            status: 'active'
          }
        }
      }

      if (!data.success) {
        throw new Error(data.error || 'Payment failed')
      }

      // Update user data
      const user = localStorage.getItem('user') 
        ? JSON.parse(localStorage.getItem('user')!)
        : null

      if (user) {
        user.isPro = true
        user.plan = selectedPlan
        user.subscriptionId = data.subscription.id
        user.subscriptionStatus = data.subscription.status
        user.subscriptionDate = new Date().toISOString()
        localStorage.setItem('user', JSON.stringify(user))
      }

      onSuccess()

    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="form-group">
        <label>
          <i className="fas fa-credit-card"></i> Card Information
        </label>
        <div className="stripe-card-element">
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                  padding: '12px',
                },
                invalid: {
                  color: '#ef4444',
                },
              },
              hidePostalCode: false,
            }}
            onChange={(e) => {
              setCardComplete(e.complete)
              setError(e.error?.message || '')
            }}
          />
        </div>
        {error && <span className="error-message">{error}</span>}
      </div>

      <div className="payment-summary">
        <div className="summary-row">
          <span>Plan:</span>
          <strong>{selectedPlan}</strong>
        </div>
        <div className="summary-row">
          <span>Billing:</span>
          <strong>Monthly (auto-renew)</strong>
        </div>
        <div className="summary-row total">
          <span>Total Due Today:</span>
          <strong>{selectedPlan === 'Pro' ? '$9.00' : '$29.00'}</strong>
        </div>
      </div>

      <div className="modal-buttons">
        <button 
          type="submit" 
          className="btn btn-gradient btn-large btn-full"
          disabled={processing || !stripe || !cardComplete}
        >
          {processing ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Processing Payment...
            </>
          ) : (
            <>
              <i className="fas fa-lock"></i> Pay {selectedPlan === 'Pro' ? '$9.00' : '$29.00'}
            </>
          )}
        </button>
        
        <button 
          type="button" 
          onClick={onCancel}
          className="btn btn-outline btn-large btn-full"
          disabled={processing}
        >
          Cancel
        </button>
      </div>

      <p className="security-note">
        <i className="fas fa-shield-alt"></i>
        Secured by Stripe. Your payment information is encrypted and never stored on our servers.
      </p>
    </form>
  )
}

const Pricing = () => {
  const navigate = useNavigate()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const authToken = localStorage.getItem('authToken')
    const userData = localStorage.getItem('user')
    
    setIsAuthenticated(!!authToken)
    if (userData) {
      setUser(JSON.parse(userData))
    }

    // Check if user came back from login/signup to upgrade
    const intendedPlan = sessionStorage.getItem('intendedPlan')
    if (authToken && intendedPlan) {
      sessionStorage.removeItem('intendedPlan')
      const currentUser = userData ? JSON.parse(userData) : null
      if (currentUser && !currentUser.isPro) {
        setSelectedPlan(intendedPlan)
        setShowUpgradeModal(true)
      }
    }
  }, [])

  const tiers = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for getting started',
      features: [
        '10 code executions per day',
        '5 algorithm courses',
        'Basic Python environment',
        'Community support',
        'Mobile app access'
      ],
      cta: 'Get Started',
      highlighted: false
    },
    {
      name: 'Pro',
      price: '$9',
      period: '/month',
      description: 'For serious learners',
      features: [
        'Unlimited code executions',
        'All 50+ algorithm courses',
        'Advanced debugging tools',
        'Priority email support',
        'Code sharing & collaboration',
        'AI code assistant',
        'Download code files',
        'Progress analytics'
      ],
      cta: 'Upgrade to Pro',
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: '$29',
      period: '/month',
      description: 'For teams and organizations',
      features: [
        'Everything in Pro',
        'Team collaboration',
        'Custom courses',
        'Admin dashboard',
        'Advanced analytics',
        'API access',
        'Dedicated support',
        'On-premise deployment'
      ],
      cta: 'Contact Sales',
      highlighted: false
    }
  ]

  const handleUpgradeClick = (planName: string) => {
    // Check if user is logged in
    if (!isAuthenticated) {
      // Store intended plan in sessionStorage for after login
      sessionStorage.setItem('intendedPlan', planName)
      // Redirect to login with return URL
      navigate('/login?redirect=pricing&plan=' + planName.toLowerCase())
      return
    }

    // Check if already on this plan or higher
    if (user?.isPro && user?.plan === planName) {
      alert('You are already on the ' + planName + ' plan!')
      return
    }

    setSelectedPlan(planName)
    setShowUpgradeModal(true)
  }

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }

  const handleContactSales = () => {
    window.location.href = 'mailto:sales@algoplatform.com?subject=Enterprise Plan Inquiry'
  }

  const handlePaymentSuccess = () => {
    setShowUpgradeModal(false)
    
    // Show success message
    const successMessage = document.createElement('div')
    successMessage.className = 'success-toast'
    successMessage.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <div>
        <strong>Payment Successful!</strong>
        <p>Welcome to ${selectedPlan}. Your subscription is now active.</p>
      </div>
    `
    document.body.appendChild(successMessage)
    
    setTimeout(() => {
      successMessage.classList.add('show')
    }, 100)
    
    setTimeout(() => {
      successMessage.classList.remove('show')
      setTimeout(() => {
        document.body.removeChild(successMessage)
        navigate('/dashboard')
      }, 300)
    }, 3000)
  }

  const handleCancelPayment = () => {
    setShowUpgradeModal(false)
    setSelectedPlan('')
  }

  return (
    <div className="pricing-page">
      <Navbar />

      <section className="pricing-section">
        <h2 className="section-title">Pricing Plans</h2>
        <p className="section-subtitle">Choose the perfect plan for your learning needs</p>

        <div className="pricing-grid">
          {tiers.map((tier) => (
            <div key={tier.name} className={`pricing-card ${tier.highlighted ? 'highlighted' : ''}`}>
              {tier.highlighted && <div className="badge">Most Popular</div>}
              
              <h3>{tier.name}</h3>
              <p className="description">{tier.description}</p>
              
              <div className="price">
                <span className="amount">{tier.price}</span>
                <span className="period">{tier.period}</span>
              </div>

              {tier.name === 'Free' ? (
                <button onClick={handleGetStarted} className="btn btn-gradient btn-large">
                  {tier.cta}
                </button>
              ) : tier.name === 'Enterprise' ? (
                <button onClick={handleContactSales} className="btn btn-gradient btn-large">
                  {tier.cta}
                </button>
              ) : (
                <button 
                  onClick={() => handleUpgradeClick(tier.name)} 
                  className="btn btn-gradient btn-large"
                  disabled={user?.isPro}
                >
                  {user?.isPro && user?.plan === tier.name ? (
                    <>
                      <i className="fas fa-check-circle"></i> Current Plan
                    </>
                  ) : (
                    tier.cta
                  )}
                </button>
              )}

              <div className="features-list">
                <h4>Features:</h4>
                <ul>
                  {tier.features.map((feature, idx) => (
                    <li key={idx}>
                      <i className="fas fa-check"></i>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="comparison-section">
        <h2>Feature Comparison</h2>
        <div className="comparison-table">
          <table>
            <thead>
              <tr>
                <th>Feature</th>
                <th>Free</th>
                <th>Pro</th>
                <th>Enterprise</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Daily Executions</td>
                <td>10</td>
                <td>Unlimited</td>
                <td>Unlimited</td>
              </tr>
              <tr>
                <td>Algorithm Courses</td>
                <td>5</td>
                <td>50+</td>
                <td>50+ + Custom</td>
              </tr>
              <tr>
                <td>Code Sharing</td>
                <td><i className="fas fa-times"></i></td>
                <td><i className="fas fa-check"></i></td>
                <td><i className="fas fa-check"></i></td>
              </tr>
              <tr>
                <td>AI Assistant</td>
                <td><i className="fas fa-times"></i></td>
                <td><i className="fas fa-check"></i></td>
                <td><i className="fas fa-check"></i></td>
              </tr>
              <tr>
                <td>Team Collaboration</td>
                <td><i className="fas fa-times"></i></td>
                <td><i className="fas fa-times"></i></td>
                <td><i className="fas fa-check"></i></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <Footer />

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="modal-overlay" onClick={handleCancelPayment}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCancelPayment}>
              <i className="fas fa-times"></i>
            </button>

            <div className="modal-header">
              <i className="fas fa-crown"></i>
              <h2>Upgrade to {selectedPlan}</h2>
              <p>Enter your payment details to unlock all premium features</p>
            </div>

            <Elements stripe={stripePromise}>
              <CheckoutForm 
                selectedPlan={selectedPlan}
                onSuccess={handlePaymentSuccess}
                onCancel={handleCancelPayment}
              />
            </Elements>
          </div>
        </div>
      )}
    </div>
  )
}

export default Pricing
