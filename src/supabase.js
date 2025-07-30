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
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    storageKey: "carsnipe-auth-token",
    flowType: "pkce", // Use PKCE flow for better security
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      "X-Client-Info": "carsnipe-online",
    },
  },
});

// Debug function to check authentication state
export const debugAuthState = async () => {
  try {
    console.log("=== AUTH DEBUG INFO ===");

    // Check session
    const session = await getCurrentSession();
    console.log("Session:", session);

    // Check localStorage
    if (typeof window !== "undefined") {
      const userInfo = localStorage.getItem("userInfo");
      console.log("localStorage userInfo:", userInfo);

      const authToken = localStorage.getItem("carsnipe-auth-token");
      console.log("localStorage auth token:", authToken);

      // Check if auth token is expired
      if (authToken) {
        try {
          const parsedToken = JSON.parse(authToken);
          const currentTime = Date.now() / 1000;
          if (parsedToken.expires_at && parsedToken.expires_at < currentTime) {
            console.log("Auth token is expired, clearing it");
            localStorage.removeItem("carsnipe-auth-token");
            return { session: null, isAuth: false };
          }
        } catch (error) {
          console.log("Error parsing auth token, clearing it");
          localStorage.removeItem("carsnipe-auth-token");
          return { session: null, isAuth: false };
        }
      }
    }

    // Check if authenticated
    const isAuth = await isAuthenticated();
    console.log("Is authenticated:", isAuth);

    console.log("=== END AUTH DEBUG ===");
    return { session, isAuth };
  } catch (error) {
    console.error("Error in debugAuthState:", error);
    return { session: null, isAuth: false };
  }
};

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  try {
    // First check for active session
    const session = await getCurrentSession();
    if (session?.user) {
      return true;
    }

    // Fallback: check localStorage for user info
    if (typeof window !== "undefined") {
      const userInfo = localStorage.getItem("userInfo");
      if (userInfo) {
        try {
          const parsedUserInfo = JSON.parse(userInfo);
          return !!parsedUserInfo?.email;
        } catch (error) {
          console.error("Error parsing user info from localStorage:", error);
          return false;
        }
      }
    }

    return false;
  } catch (error) {
    console.error("Error checking authentication status:", error);
    return false;
  }
};

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
  try {
    console.log("getCurrentSession: Checking for existing session...");
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    console.log("getCurrentSession: Session result:", session, "error:", error);

    if (error) {
      console.error("getCurrentSession: Error getting session:", error);
      return null;
    }

    return session;
  } catch (error) {
    console.error("getCurrentSession: Caught error:", error);
    return null;
  }
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
