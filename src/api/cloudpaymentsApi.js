// CloudPayments API integration
import { supabase } from "../supabase";

// CloudPayments configuration
const CLOUDPAYMENTS_CONFIG = {
  publicId:
    process.env.REACT_APP_CLOUDPAYMENTS_PUBLIC_ID ||
    "test_api_00000000000000000000001",
  baseUrl:
    process.env.REACT_APP_CLOUDPAYMENTS_BASE_URL ||
    "https://api.cloudpayments.ru",
  currency: "USD",
  language: "en-US",
};

// Create payment session
export const createPaymentSession = async (paymentData) => {
  try {
    const { amount, currency, description, email, userId, credits } =
      paymentData;

    // Create payment record in database
    const { data: paymentRecord, error: dbError } = await supabase
      .from("payments")
      .insert([
        {
          user_id: userId,
          amount: amount,
          currency: currency || CLOUDPAYMENTS_CONFIG.currency,
          description: description,
          status: "pending",
          credits: credits,
          email: email,
        },
      ])
      .select()
      .single();

    if (dbError) throw dbError;

    // Prepare CloudPayments payment data
    const paymentRequest = {
      Amount: amount,
      Currency: currency || CLOUDPAYMENTS_CONFIG.currency,
      Description: description,
      Email: email,
      RequireConfirmation: false,
      SendEmail: true,
      InvoiceId: paymentRecord.id,
      CultureName: CLOUDPAYMENTS_CONFIG.language,
      AccountId: userId,
      JsonData: {
        userId: userId,
        credits: credits,
        paymentId: paymentRecord.id,
      },
    };

    // In a real implementation, you would make a server-side call to CloudPayments
    // For now, we'll simulate the payment flow
    return {
      success: true,
      paymentId: paymentRecord.id,
      paymentUrl: `/payment/${paymentRecord.id}`,
      data: paymentRequest,
    };
  } catch (error) {
    console.error("Error creating payment session:", error);
    throw error;
  }
};

// Process payment callback
export const processPaymentCallback = async (
  paymentId,
  status,
  transactionId
) => {
  try {
    // Update payment record
    const { data: payment, error: updateError } = await supabase
      .from("payments")
      .update({
        status: status,
        transaction_id: transactionId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentId)
      .select()
      .single();

    if (updateError) throw updateError;

    // If payment is successful, update user credits
    if (status === "completed" && payment) {
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("money")
        .eq("id", payment.user_id)
        .single();

      if (userError) throw userError;

      const newMoney = (user.money || 0) + payment.credits;

      const { error: moneyError } = await supabase
        .from("users")
        .update({ money: newMoney })
        .eq("id", payment.user_id);

      if (moneyError) throw moneyError;
    }

    return { success: true, payment };
  } catch (error) {
    console.error("Error processing payment callback:", error);
    throw error;
  }
};

// Get payment status
export const getPaymentStatus = async (paymentId) => {
  try {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting payment status:", error);
    throw error;
  }
};

// Get user payment history
export const getUserPayments = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting user payments:", error);
    throw error;
  }
};
