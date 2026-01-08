# Stripe Integration Guide

## Overview
This application integrates Stripe for secure payment processing and subscription management.

## Setup Instructions

### 1. Get Stripe API Keys
1. Sign up at [stripe.com](https://stripe.com)
2. Get your API keys from the Dashboard
3. You'll need both:
   - **Publishable Key** (starts with `pk_test_` for test mode)
   - **Secret Key** (starts with `sk_test_` for test mode)

### 2. Configure Frontend
Update the publishable key in `src/pages/Pricing.tsx`:

```typescript
const stripePromise = loadStripe('pk_test_YOUR_PUBLISHABLE_KEY_HERE')
```

### 3. Backend Setup (Required for Production)

Create a backend API endpoint `/api/create-subscription` that:

1. **Receives** payment method ID from frontend
2. **Creates** Stripe customer
3. **Attaches** payment method to customer
4. **Creates** subscription with price ID
5. **Returns** subscription details

Example backend code (Node.js/Express):

```javascript
const stripe = require('stripe')('sk_test_YOUR_SECRET_KEY');

app.post('/api/create-subscription', async (req, res) => {
  const { paymentMethodId, plan, priceId } = req.body;
  
  try {
    // Get user from auth token
    const user = await getUserFromToken(req.headers.authorization);
    
    // Create customer
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    
    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      expand: ['latest_invoice.payment_intent'],
    });
    
    // Update user in database
    await updateUserSubscription(user.id, {
      stripeCustomerId: customer.id,
      subscriptionId: subscription.id,
      plan: plan,
      status: subscription.status
    });
    
    res.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status
      }
    });
    
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});
```

### 4. Create Stripe Products & Prices

In your Stripe Dashboard:

1. Go to **Products** → **Add Product**
2. Create products for:
   - **Pro Plan**: $9/month
   - **Enterprise Plan**: $29/month
3. Copy the Price IDs (e.g., `price_1234567890`)
4. Update in `Pricing.tsx`:

```typescript
priceId: selectedPlan === 'Pro' ? 'price_YOUR_PRO_ID' : 'price_YOUR_ENTERPRISE_ID'
```

### 5. Test Card Numbers

Use these test cards in development:

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 9995` | Declined card |
| `4000 0025 0000 3155` | Requires authentication |

- Any future expiry date (e.g., 12/34)
- Any 3-digit CVV

## User Flow

1. **User browses pricing page**
2. **Clicks "Upgrade to Pro"**
3. **If not logged in**: Redirected to signup/login with plan parameter
4. **After login**: Returns to pricing page
5. **Stripe modal opens**: User enters card details
6. **Payment processed**: Subscription created
7. **Success**: User redirected to dashboard with Pro access

## Security Features

✅ **PCI Compliant**: Card data never touches your server  
✅ **Tokenization**: Stripe creates secure payment tokens  
✅ **3D Secure**: Supports SCA authentication  
✅ **Encrypted**: All data transmitted via HTTPS  

## Current Implementation Status

### ✅ Completed
- Stripe React Elements integration
- Payment modal UI
- Form validation
- Success/error handling
- User flow (signup → login → upgrade)
- localStorage user state management

### 🚧 Needs Backend
- API endpoint for subscription creation
- Database to store user subscriptions
- Webhook handlers for subscription events
- Customer portal for managing subscriptions

## Webhook Setup (Production)

Set up webhooks to handle events:

1. **Go to**: Stripe Dashboard → Developers → Webhooks
2. **Add endpoint**: `https://yourdomain.com/api/webhooks/stripe`
3. **Listen for events**:
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

Example webhook handler:

```javascript
app.post('/api/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = 'whsec_YOUR_WEBHOOK_SECRET';
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
    
    switch (event.type) {
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
    }
    
    res.json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});
```

## Environment Variables

Create `.env` file:

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Resources

- [Stripe React Docs](https://stripe.com/docs/stripe-js/react)
- [Subscriptions Guide](https://stripe.com/docs/billing/subscriptions/overview)
- [Webhook Events](https://stripe.com/docs/api/events)
- [Testing Cards](https://stripe.com/docs/testing)

## Support

For Stripe integration issues:
- Check [Stripe Status](https://status.stripe.com)
- View logs in [Stripe Dashboard](https://dashboard.stripe.com/logs)
- Contact Stripe Support
