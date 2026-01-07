import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import '../styles/Pricing.css'

const Pricing = () => {
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

              <Link to="/login" className="btn btn-gradient btn-large">
                {tier.cta}
              </Link>

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

export default Pricing
