import React, { useState, useEffect } from 'react';
import { createPaymentSession, getPaymentStatus } from '../../api/cloudpaymentsApi';
import './CloudPaymentsPayment.css';

const CloudPaymentsPayment = ({ 
  amount, 
  credits, 
  description, 
  email, 
  userId, 
  onSuccess, 
  onError, 
  onCancel 
}) => {
  const [paymentId, setPaymentId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize payment session
  useEffect(() => {
    const initializePayment = async () => {
      try {
        setLoading(true);
        setError(null);

        const paymentData = {
          amount: amount,
          currency: 'USD',
          description: description,
          email: email,
          userId: userId,
          credits: credits
        };

        const result = await createPaymentSession(paymentData);
        
        if (result.success) {
          setPaymentId(result.paymentId);
          // In a real implementation, you would redirect to CloudPayments hosted page
          // or embed their payment widget
          console.log('Payment session created:', result);
        } else {
          throw new Error('Failed to create payment session');
        }
      } catch (err) {
        setError(err.message);
        onError?.(err);
      } finally {
        setLoading(false);
      }
    };

    if (amount && credits && email && userId) {
      initializePayment();
    }
  }, [amount, credits, description, email, userId, onError]);

  // Poll payment status
  useEffect(() => {
    if (!paymentId) return;

    const pollStatus = async () => {
      try {
        const payment = await getPaymentStatus(paymentId);
        setPaymentStatus(payment.status);

        if (payment.status === 'completed') {
          onSuccess?.(payment);
        } else if (payment.status === 'failed') {
          setError('Payment failed');
          onError?.(new Error('Payment failed'));
        }
      } catch (err) {
        console.error('Error polling payment status:', err);
      }
    };

    const interval = setInterval(pollStatus, 2000);
    return () => clearInterval(interval);
  }, [paymentId, onSuccess, onError]);

  const handlePaymentSubmit = async () => {
    // In a real implementation, this would submit the payment to CloudPayments
    // For now, we'll simulate a successful payment
    try {
      setLoading(true);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update payment status to completed
      const payment = await getPaymentStatus(paymentId);
      setPaymentStatus('completed');
      onSuccess?.(payment);
      
    } catch (err) {
      setError(err.message);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
  };

  if (loading && !paymentId) {
    return (
      <div className="cloudpayments-payment">
        <div className="payment-loading">
          <div className="spinner"></div>
          <p>Initializing payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cloudpayments-payment">
        <div className="payment-error">
          <h3>Payment Error</h3>
          <p>{error}</p>
          <button onClick={handleCancel} className="cancel-button">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cloudpayments-payment">
      <div className="payment-container">
        <h3>Complete Your Purchase</h3>
        
        <div className="payment-details">
          <div className="payment-item">
            <span>Credits:</span>
            <span>{credits.toLocaleString()} CR</span>
          </div>
          <div className="payment-item">
            <span>Amount:</span>
            <span>${amount.toFixed(2)}</span>
          </div>
          <div className="payment-item">
            <span>Email:</span>
            <span>{email}</span>
          </div>
        </div>

        {paymentStatus === 'pending' && (
          <div className="payment-actions">
            <button 
              onClick={handlePaymentSubmit} 
              className="pay-button"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
            <button onClick={handleCancel} className="cancel-button">
              Cancel
            </button>
          </div>
        )}

        {paymentStatus === 'completed' && (
          <div className="payment-success">
            <h4>Payment Successful!</h4>
            <p>Your credits have been added to your account.</p>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="payment-failed">
            <h4>Payment Failed</h4>
            <p>Please try again or contact support.</p>
            <button onClick={handleCancel} className="cancel-button">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CloudPaymentsPayment; 