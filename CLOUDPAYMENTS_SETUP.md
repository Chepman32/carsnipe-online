# CloudPayments Integration Setup

This guide explains how to set up CloudPayments for in-app purchases in the Carsnipe application.

## Overview

The application has been refactored to use CloudPayments instead of Stripe for payment processing. The integration includes:

- CloudPayments API service (`src/api/cloudpaymentsApi.js`)
- Payment component (`src/components/CloudPaymentsPayment/`)
- Updated Store component with CloudPayments integration
- Database schema for payment tracking

## Database Setup

### 1. Run the Updated Schema

The payments table has been added to the database schema. Run the updated schema:

```sql
-- Payments table for CloudPayments integration
CREATE TABLE payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  status TEXT DEFAULT 'pending',
  credits INTEGER NOT NULL,
  email TEXT,
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Database Migration

If you're updating an existing database, run this migration:

```sql
-- Add payments table to existing database
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  status TEXT DEFAULT 'pending',
  credits INTEGER NOT NULL,
  email TEXT,
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Environment Configuration

### 1. Create Environment File

Copy the example environment file and configure your CloudPayments credentials:

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` with your CloudPayments credentials:

```env
# CloudPayments Configuration
REACT_APP_CLOUDPAYMENTS_PUBLIC_ID=your_cloudpayments_public_id
REACT_APP_CLOUDPAYMENTS_BASE_URL=https://api.cloudpayments.ru

# Supabase Configuration (if not already configured)
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## CloudPayments Account Setup

### 1. Create CloudPayments Account

1. Sign up at [CloudPayments](https://cloudpayments.ru/)
2. Complete account verification
3. Get your API credentials from the dashboard

### 2. Configure Payment Methods

In your CloudPayments dashboard:
1. Enable payment methods (cards, digital wallets, etc.)
2. Configure webhook endpoints for payment notifications
3. Set up currency conversion if needed

### 3. Test Mode vs Production

- **Test Mode**: Use test credentials for development
- **Production Mode**: Use live credentials for production

## Implementation Details

### Payment Flow

1. **User selects a credit package** in the Store
2. **Payment session is created** with CloudPayments
3. **User completes payment** through CloudPayments interface
4. **Payment callback** updates user credits in database
5. **Success/error handling** provides user feedback

### Key Components

#### `src/api/cloudpaymentsApi.js`
- Handles CloudPayments API communication
- Creates payment sessions
- Processes payment callbacks
- Manages payment status tracking

#### `src/components/CloudPaymentsPayment/`
- Payment UI component
- Handles payment flow
- Shows payment status
- Error handling

#### `src/pages/Store/Store.jsx`
- Updated to use CloudPayments instead of Stripe
- Integrated payment modal
- Handles purchase flow

## Webhook Configuration

### 1. Set Up Webhook Endpoint

Create a webhook endpoint in your backend to handle CloudPayments callbacks:

```javascript
// Example webhook handler
app.post('/webhooks/cloudpayments', async (req, res) => {
  const { InvoiceId, Status, TransactionId } = req.body;
  
  try {
    await processPaymentCallback(InvoiceId, Status, TransactionId);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});
```

### 2. Configure Webhook URL

In your CloudPayments dashboard:
- Set webhook URL: `https://your-domain.com/webhooks/cloudpayments`
- Enable notifications for: `Pay`, `Fail`, `Refund`

## Testing

### 1. Test Payment Flow

1. Start the application in development mode
2. Navigate to the Store page
3. Select a credit package
4. Complete test payment
5. Verify credits are added to user account

### 2. Test Error Scenarios

- Test with invalid payment data
- Test network failures
- Test payment cancellation
- Test webhook failures

## Security Considerations

### 1. API Key Security

- Never expose API keys in client-side code
- Use environment variables for configuration
- Rotate keys regularly

### 2. Payment Validation

- Validate payment amounts server-side
- Verify payment signatures
- Implement idempotency for webhooks

### 3. User Data Protection

- Encrypt sensitive payment data
- Follow GDPR compliance
- Implement proper data retention policies

## Troubleshooting

### Common Issues

1. **Payment not processing**
   - Check API credentials
   - Verify webhook configuration
   - Check network connectivity

2. **Credits not added**
   - Verify webhook is receiving callbacks
   - Check database permissions
   - Review payment status in CloudPayments dashboard

3. **Payment modal not showing**
   - Check component imports
   - Verify props are passed correctly
   - Check console for errors

### Debug Mode

Enable debug logging by adding to your environment:

```env
REACT_APP_DEBUG_PAYMENTS=true
```

## Migration from Stripe

### What Changed

1. **Payment Links**: Removed Stripe payment links
2. **Payment Flow**: Integrated CloudPayments payment modal
3. **Database**: Added payments table for tracking
4. **API**: Created CloudPayments API service

### Migration Steps

1. Update database schema
2. Configure CloudPayments credentials
3. Test payment flow
4. Update production environment
5. Monitor payment processing

## Support

For CloudPayments support:
- [CloudPayments Documentation](https://developers.cloudpayments.ru/)
- [CloudPayments Support](https://cloudpayments.ru/support)

For application-specific issues:
- Check the application logs
- Review the payment flow
- Verify database connectivity 