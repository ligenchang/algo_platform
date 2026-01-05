// Backend API Server for CodeFlow Pro
// This is a Node.js/Express server for handling authentication and subscriptions

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files

// In-memory database (replace with real database in production)
const users = new Map();
const subscriptions = new Map();

// User model structure:
// {
//   id: string,
//   email: string,
//   password: string (hashed),
//   createdAt: Date,
//   tier: 'free' | 'pro' | 'enterprise',
//   executionsToday: number,
//   lastExecutionDate: Date
// }

// ==================== Authentication Routes ====================

// Register new user
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Check if user exists
        if (users.has(email)) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = {
            id: Date.now().toString(),
            email,
            password: hashedPassword,
            createdAt: new Date(),
            tier: 'free',
            executionsToday: 0,
            lastExecutionDate: new Date()
        };

        users.set(email, user);

        // Generate JWT
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                tier: user.tier,
                executionsToday: user.executionsToday
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Find user
        const user = users.get(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                tier: user.tier,
                executionsToday: user.executionsToday
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Get current user info
app.get('/api/auth/me', authenticateToken, (req, res) => {
    const user = users.get(req.user.email);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Reset execution count if it's a new day
    const today = new Date().toDateString();
    const lastExecution = new Date(user.lastExecutionDate).toDateString();
    
    if (today !== lastExecution) {
        user.executionsToday = 0;
        user.lastExecutionDate = new Date();
    }

    res.json({
        id: user.id,
        email: user.email,
        tier: user.tier,
        executionsToday: user.executionsToday
    });
});

// ==================== Subscription Routes ====================

// Get subscription plans
app.get('/api/subscriptions/plans', (req, res) => {
    res.json({
        plans: [
            {
                id: 'free',
                name: 'Free',
                price: 0,
                features: {
                    maxExecutions: 10,
                    cloudStorage: false,
                    codeSharing: false,
                    aiAssist: false,
                    advancedDebug: false
                }
            },
            {
                id: 'pro',
                name: 'Pro',
                price: 9,
                features: {
                    maxExecutions: -1, // unlimited
                    cloudStorage: true,
                    codeSharing: true,
                    aiAssist: false,
                    advancedDebug: true
                }
            },
            {
                id: 'enterprise',
                name: 'Enterprise',
                price: 29,
                features: {
                    maxExecutions: -1,
                    cloudStorage: true,
                    codeSharing: true,
                    aiAssist: true,
                    advancedDebug: true
                }
            }
        ]
    });
});

// Create subscription (upgrade)
app.post('/api/subscriptions/create', authenticateToken, (req, res) => {
    try {
        const { tier, paymentMethod } = req.body;

        if (!['pro', 'enterprise'].includes(tier)) {
            return res.status(400).json({ error: 'Invalid tier' });
        }

        const user = users.get(req.user.email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // In production, integrate with Stripe or other payment processor
        // For demo, just update the tier
        user.tier = tier;
        user.executionsToday = 0; // Reset on upgrade

        res.json({
            success: true,
            subscription: {
                tier: user.tier,
                startDate: new Date(),
                status: 'active'
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Cancel subscription
app.post('/api/subscriptions/cancel', authenticateToken, (req, res) => {
    try {
        const user = users.get(req.user.email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.tier = 'free';
        user.executionsToday = 0;

        res.json({
            success: true,
            message: 'Subscription cancelled'
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== Code Execution Routes ====================

// Track code execution
app.post('/api/execute', authenticateToken, (req, res) => {
    try {
        const user = users.get(req.user.email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Reset execution count if it's a new day
        const today = new Date().toDateString();
        const lastExecution = new Date(user.lastExecutionDate).toDateString();
        
        if (today !== lastExecution) {
            user.executionsToday = 0;
            user.lastExecutionDate = new Date();
        }

        // Check limits
        const maxExecutions = user.tier === 'free' ? 10 : -1;
        if (maxExecutions > 0 && user.executionsToday >= maxExecutions) {
            return res.status(429).json({ 
                error: 'Execution limit reached',
                limit: maxExecutions,
                current: user.executionsToday
            });
        }

        // Increment counter
        user.executionsToday++;
        user.lastExecutionDate = new Date();

        res.json({
            success: true,
            executionsToday: user.executionsToday,
            maxExecutions: maxExecutions
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== Code Storage Routes ====================

// Save code (Pro+)
app.post('/api/code/save', authenticateToken, (req, res) => {
    try {
        const user = users.get(req.user.email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.tier === 'free') {
            return res.status(403).json({ error: 'Cloud storage is a Pro feature' });
        }

        const { filename, code } = req.body;
        
        // In production, save to database
        const codeId = Date.now().toString();
        
        res.json({
            success: true,
            codeId,
            message: 'Code saved successfully'
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Share code (Pro+)
app.post('/api/code/share', authenticateToken, (req, res) => {
    try {
        const user = users.get(req.user.email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.tier === 'free') {
            return res.status(403).json({ error: 'Code sharing is a Pro feature' });
        }

        const { code } = req.body;
        
        // Generate share link
        const shareId = Math.random().toString(36).substring(7);
        
        res.json({
            success: true,
            shareUrl: `https://codeflow.pro/share/${shareId}`
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== Start Server ====================

app.listen(PORT, () => {
    console.log(`🚀 CodeFlow Pro API Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔐 Remember to set JWT_SECRET in production!`);
});

module.exports = app;
