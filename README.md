# CodeFlow Pro - Premium Python IDE

A professional, premium Python code editor with subscription tiers, built for modern web browsers.

## 🌟 Features

### Free Tier
- ✅ 10 code executions per day
- ✅ Monaco Editor with full syntax intelligence
- ✅ Basic debugging
- ✅ Code save & export
- ✅ Local file management

### Pro Tier ($9/month)
- ✅ **Unlimited** code executions
- ✅ Advanced syntax intelligence
- ✅ Cloud storage (10GB)
- ✅ Code sharing & collaboration
- ✅ Advanced debugging tools
- ✅ Priority support

### Enterprise Tier ($29/month)
- ✅ Everything in Pro
- ✅ AI code assistant
- ✅ AI-powered code completion
- ✅ Unlimited cloud storage
- ✅ Team collaboration features
- ✅ Advanced analytics
- ✅ 24/7 priority support

## 🚀 Quick Start

### Frontend Only (Demo Mode)

1. Open `index.html` in your browser or use a local server:
```bash
python3 -m http.server 8000
```

2. Visit `http://localhost:8000`

3. Start coding! The frontend works with demo subscription tiers.

### Full Stack Setup (With Backend API)

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=production
```

3. Start the server:
```bash
npm start
```

4. Visit `http://localhost:3000`

## 🏗️ Architecture

### Frontend
- **Monaco Editor**: VS Code's editor engine for syntax intelligence
- **Pyodide**: Python runtime in the browser
- **Responsive Design**: Works on desktop and mobile
- **Modern UI**: Gradient animations, glassmorphism effects

### Backend (Optional)
- **Express.js**: RESTful API server
- **JWT Authentication**: Secure user sessions
- **Subscription Management**: Tier-based feature gates
- **Usage Tracking**: Execution limits and analytics

## 📁 Project Structure

```
codeflow-pro/
├── index.html          # Main HTML file
├── styles.css          # Premium styling and animations
├── app.js              # Frontend logic and subscription handling
├── server.js           # Backend API (optional)
├── package.json        # Node.js dependencies
└── README.md           # This file
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Subscriptions
- `GET /api/subscriptions/plans` - Get available plans
- `POST /api/subscriptions/create` - Create/upgrade subscription
- `POST /api/subscriptions/cancel` - Cancel subscription

### Code Management
- `POST /api/execute` - Track code execution
- `POST /api/code/save` - Save code to cloud (Pro+)
- `POST /api/code/share` - Generate shareable link (Pro+)

## 💳 Payment Integration

For production, integrate with payment processors:
- **Stripe**: Recommended for subscription billing
- **PayPal**: Alternative payment method
- **Paddle**: Merchant of record solution

## 🔧 Configuration

### Environment Variables
```env
PORT=3000                    # Server port
JWT_SECRET=your-secret-key   # JWT signing key
NODE_ENV=production          # Environment
STRIPE_SECRET_KEY=sk_xxx     # Stripe secret key (optional)
DATABASE_URL=postgres://...   # Database connection (optional)
```

### Customization
- **Tiers**: Modify `tierConfigs` in `app.js`
- **Styling**: Edit CSS variables in `styles.css`
- **Features**: Add/remove feature gates in `userState.features`

## 🚀 Deployment

### Frontend (Static Hosting)
Deploy to:
- **Vercel**: Zero-config deployment
- **Netlify**: Continuous deployment from Git
- **GitHub Pages**: Free static hosting
- **Cloudflare Pages**: Fast global CDN

### Backend (Node.js Hosting)
Deploy to:
- **Heroku**: Easy Node.js deployment
- **Railway**: Modern hosting platform
- **DigitalOcean**: App Platform or Droplets
- **AWS**: EC2, Elastic Beanstalk, or Lambda

## 📝 Development

### Run in development mode:
```bash
npm run dev
```

### Add new features:
1. Update tier configuration in `app.js`
2. Add feature gates with `userState.features`
3. Update pricing cards in `index.html`
4. Add backend routes in `server.js`

## 🔒 Security Notes

⚠️ **Important for Production:**
- Change `JWT_SECRET` to a secure random string
- Use HTTPS for all connections
- Implement rate limiting
- Add CSRF protection
- Use a real database (PostgreSQL, MongoDB)
- Implement proper password reset flow
- Add email verification
- Store sensitive data encrypted

## 📊 Analytics & Monitoring

Integrate with:
- **Google Analytics**: User behavior tracking
- **Mixpanel**: Product analytics
- **Sentry**: Error tracking
- **LogRocket**: Session replay

## 🤝 Contributing

This is a demo project. For production use:
1. Add comprehensive tests
2. Implement proper error handling
3. Add data persistence layer
4. Enhance security measures
5. Add monitoring and logging

## 📄 License

MIT License - Feel free to use this project as a starting point for your own premium SaaS application.

## 🎯 Roadmap

- [ ] Real payment integration (Stripe)
- [ ] User dashboard
- [ ] Code history and versioning
- [ ] Real-time collaboration
- [ ] Code templates library
- [ ] Package management
- [ ] Terminal emulator
- [ ] Git integration
- [ ] Mobile apps (iOS/Android)

## 💬 Support

For questions or support:
- Email: support@codeflow.pro (example)
- Discord: Join our community
- Documentation: docs.codeflow.pro (example)

---

Built with ❤️ using Monaco Editor, Pyodide, and modern web technologies.
