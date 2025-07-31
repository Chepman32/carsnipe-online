// Test utility for CloudPayments integration
import {
  createPaymentSession,
  getPaymentStatus,
  processPaymentCallback,
} from "../api/cloudpaymentsApi";

export const testCloudPaymentsIntegration = async () => {
  console.log("Testing CloudPayments integration...");

  try {
    // Test 1: Create payment session
    console.log("Test 1: Creating payment session...");
    const paymentData = {
      amount: 1.99,
      currency: "USD",
      description: "Test payment for 50,000 CR",
      email: "test@example.com",
      userId: "test-user-id",
      credits: 50000,
    };

    const sessionResult = await createPaymentSession(paymentData);
    console.log("Payment session created:", sessionResult);

    if (!sessionResult.success) {
      throw new Error("Failed to create payment session");
    }

    // Test 2: Get payment status
    console.log("Test 2: Getting payment status...");
    const paymentStatus = await getPaymentStatus(sessionResult.paymentId);
    console.log("Payment status:", paymentStatus);

    // Test 3: Process payment callback (simulate successful payment)
    console.log("Test 3: Processing payment callback...");
    const callbackResult = await processPaymentCallback(
      sessionResult.paymentId,
      "completed",
      "test-transaction-id"
    );
    console.log("Payment callback processed:", callbackResult);

    console.log("✅ All CloudPayments tests passed!");
    return true;
  } catch (error) {
    console.error("❌ CloudPayments test failed:", error);
    return false;
  }
};

export const testPaymentFlow = async (userId, email) => {
  console.log("Testing complete payment flow...");

  try {
    // Create a test payment
    const paymentData = {
      amount: 1.99,
      currency: "USD",
      description: "Test payment flow",
      email: email,
      userId: userId,
      credits: 50000,
    };

    const session = await createPaymentSession(paymentData);
    console.log("Payment session:", session);

    // Simulate payment completion
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const result = await processPaymentCallback(
      session.paymentId,
      "completed",
      "flow-test-transaction"
    );

    console.log("Payment flow completed:", result);
    return result;
  } catch (error) {
    console.error("Payment flow test failed:", error);
    throw error;
  }
};

// Export for use in development
if (process.env.NODE_ENV === "development") {
  window.testCloudPayments = testCloudPaymentsIntegration;
  window.testPaymentFlow = testPaymentFlow;
}
