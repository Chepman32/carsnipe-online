import { createClient } from "@supabase/supabase-js";

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || "YOUR_SUPABASE_URL";
const supabaseAnonKey =
  process.env.REACT_APP_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper function to get current user
export const getCurrentUser = async () => {
  try {
    console.log("getCurrentUser: Starting authentication check...");
    console.log("getCurrentUser: Supabase URL:", supabaseUrl);
    console.log("getCurrentUser: Supabase client:", supabase);

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error("getCurrentUser timeout after 10 seconds")),
        10000
      );
    });

    const authPromise = supabase.auth.getUser();

    const {
      data: { user },
      error,
    } = await Promise.race([authPromise, timeoutPromise]);

    console.log(
      "getCurrentUser: Supabase auth response - user:",
      user,
      "error:",
      error
    );

    if (error) {
      console.error("getCurrentUser: Supabase error:", error);
      throw error;
    }

    console.log("getCurrentUser: Returning user:", user);
    return user;
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    // If there's an error (like no authenticated user), return null instead of throwing
    return null;
  }
};

// Helper function to get session
export const getCurrentSession = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

// Helper function for sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Helper function for Google OAuth
export const signInWithGoogle = async () => {
  console.log("signInWithGoogle: Starting Google OAuth process...");
  console.log("signInWithGoogle: Redirect URL:", `${window.location.origin}/`);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/`,
    },
  });
  console.log("signInWithGoogle: Response - data:", data, "error:", error);
  if (error) {
    console.error("signInWithGoogle: OAuth error:", error);
    throw error;
  }
  console.log("signInWithGoogle: Success, returning data:", data);
  return data;
};

// Helper function for email/password sign in
export const signInWithEmail = async (email, password) => {
  console.log("signInWithEmail: Attempting sign in for email:", email);

  try {
    // Add timeout to prevent hanging indefinitely
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error("Authentication timeout after 30 seconds")),
        30000
      );
    });

    const authPromise = supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("signInWithEmail: Waiting for Supabase response...");
    const { data, error } = await Promise.race([authPromise, timeoutPromise]);

    console.log(
      "signInWithEmail: Response received - data:",
      data,
      "error:",
      error
    );

    if (error) {
      console.error("signInWithEmail: Authentication error:", error);
      throw error;
    }

    console.log("signInWithEmail: Success, returning data:", data);
    return data;
  } catch (err) {
    console.error("signInWithEmail: Caught error:", err);
    throw err;
  }
};

// Helper function for email/password sign up
export const signUpWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export default supabase;
