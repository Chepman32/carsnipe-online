import React, { useCallback, useEffect, useState } from "react";
import { supabase, getCurrentUser, getCurrentSession, signOut, signInWithGoogle, signInWithEmail, signUpWithEmail } from "./supabase";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import {
  Spin,
  Button,
  Form,
  Input,
  message,
  Card,
  Typography,
  Space,
  Divider
} from "antd";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import MusicPlayer from "./components/MusicPlayer/MusicPlayer";
import AuctionPage from "./pages/AuctionPage/AuctionPage";
import CustomHeader from "./components/CustomHeader/CustomHeader";
import CarsStore from "./pages/CarPages/CarsStore";
import MyCars from "./pages/CarPages/MyCars";
import AuctionsHub from "./pages/AuctionPage/AuctionHub";
import MyBids from "./pages/AuctionPage/MyBids";
import MyAuctions from "./pages/AuctionPage/MyAuctions";
import PaymentError from "./components/PaymentError";
import Store from "./pages/Store/Store";
import ProfileEditPage from "./pages/ProfileEditPage/ProfileEditPage";
import { checkAndUpdateAchievements, extractNameFromEmail, selectAvatar } from "./functions";
import AchievementList from "./pages/AchievementList/AchievementList";
import { MainPage } from "./pages/MainPage/MainPage";
import MusicUploadPage from "./pages/MusicUploadPage/MusicUploadPage";
import MusicLibraryPage from "./pages/MusicLibraryPage/MusicLibraryPage";
import GameSettings from "./pages/GameSettings/GameSettings";
import UserPage from "./pages/UserPage/UserPage";
import MessengerPage from "./pages/MessengerPage/MessengerPage";
import { DarkModeWrapper } from "./components/DarkModeWrapper/DarkModeWrapper";
import { avatars } from "./avatars";
import { DemoModeProvider, useDemoMode } from "./contexts/DemoModeContext";
import "./AuthStyles.css";

// Supabase client is configured in ./supabase.js

const { Title, Text } = Typography; 

function BackspaceHandler() {
  const navigate = useNavigate();
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Backspace") {
        const activeElement = document.activeElement;
        const isInputFocused =
          activeElement &&
          (activeElement.tagName === "INPUT" ||
            activeElement.tagName === "TEXTAREA" ||
            activeElement.isContentEditable);
        if (!isInputFocused) {
          event.preventDefault();
          navigate(-1);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate]);
  return null;
}


const AuthComponent = ({ onAuthSuccess, currentAuthenticatedUser }) => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  const handleGoogleSignIn = async () => {
    try {
      console.log('Google Sign In button clicked');
      setLoading(true);
      console.log('Loading state set to true');
      const result = await signInWithGoogle();
      console.log('Google Sign In result:', result);
    } catch (error) {
      console.error('Google Sign In error:', error);
      message.error(error.message);
    } finally {
      console.log('Google Sign In process finished, setting loading to false');
      setLoading(false);
    }
  };

  const handleEmailAuth = async (values) => {
    try {
      console.log('Email auth button clicked:', isSignUp ? 'Sign Up' : 'Sign In', values);
      
      // Check if user is already signed in
      const currentUser = await getCurrentUser();
      console.log('Current user before auth attempt:', currentUser);
      
      console.log('Debug: currentUser:', currentUser);
      console.log('Debug: currentUser.email:', currentUser?.email);
      console.log('Debug: values.email:', values.email);
      console.log('Debug: isSignUp:', isSignUp);
      console.log('Debug: condition check:', currentUser && currentUser.email === values.email && !isSignUp);
      
      if (currentUser && currentUser.email === values.email && !isSignUp) {
        console.log('User is already signed in with this email, triggering auth success...');
        message.success('Already signed in!');
        // Trigger the auth state change to update the UI
        try {
          console.log('About to call currentAuthenticatedUser...');
          await currentAuthenticatedUser();
          console.log('currentAuthenticatedUser called successfully');
        } catch (error) {
          console.error('Error calling currentAuthenticatedUser:', error);
        }
        return;
      }
      
      setLoading(true);
      console.log('Loading state set to true for email auth');
      if (isSignUp) {
        const result = await signUpWithEmail(values.email, values.password);
        console.log('Sign Up result:', result);
        message.success('Check your email for verification link');
      } else {
        const result = await signInWithEmail(values.email, values.password);
        console.log('Email Sign In result:', result);
        // After successful sign in, trigger the auth state update
        if (result?.user) {
          console.log('Sign in successful, triggering auth state update...');
          await currentAuthenticatedUser();
        }
      }
    } catch (error) {
      console.error('Email auth error:', error);
      message.error(error.message);
    } finally {
      console.log('Email auth process finished, setting loading to false');
      setLoading(false);
    }
  };

  const handleDemoMode = () => {
    try {
      console.log('Demo mode button clicked, current state:', isDemoMode);
      toggleDemoMode();
      console.log('Demo mode toggled, new state:', !isDemoMode);
    } catch (error) {
      console.error('Error in demo mode toggle:', error);
    }
  };

  return (
    <Card
      style={{
        width: 400,
        margin: '0 auto',
        marginTop: '20vh',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
        <div>
          <img 
            alt="Carsnipe Logo" 
            src={require("./assets/images/Logo.png")} 
            width="160px" 
          />
          <Title level={3} style={{ marginTop: 16 }}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </Title>
          <Text type="secondary">
            {isSignUp ? 'Join Carsnipe Online today' : 'Log in to Carsnipe Online to continue'}
          </Text>
        </div>

        <Button 
          type="primary" 
          size="large" 
          block
          loading={loading}
          onClick={handleGoogleSignIn}
          style={{ height: 48 }}
        >
          Continue with Google
        </Button>

        <Divider>OR</Divider>

        <Form
          onFinish={handleEmailAuth}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
          >
            <Input placeholder="Email address" />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[{ required: true, min: 6, message: 'Password must be at least 6 characters' }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              loading={loading}
              style={{ height: 48 }}
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </Form.Item>
        </Form>

        <div>
          <Button 
            type="link" 
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </Button>
        </div>

        <Button
          type="default"
          block
          onClick={handleDemoMode}
          style={{ marginTop: 16 }}
        >
          {isDemoMode ? 'Exit Demo Mode' : 'Try Demo Mode'}
        </Button>
      </Space>
    </Card>
  );
};



const backgrounds = [
  "/videos/Intro.mp4",
  "/videos/Intro1.mp4",
  "/videos/Intro2.mp4",
  "/videos/Intro3.mp4",
  "/videos/Intro4.mp4",
  "/videos/Intro5.mp4",
]

const AppContent = ({ playerInfo, money, setMoney, currentAuthenticatedUser, signOut, setPlayerInfo }) => {
  const { isDemoMode, demoUser } = useDemoMode();

  return (
    <Provider store={store}>
      <main>
        <CustomHeader 
          money={isDemoMode ? demoUser?.money : money} 
          nickname={isDemoMode ? demoUser?.nickname : playerInfo?.nickname} 
          avatar={isDemoMode ? avatars[demoUser?.avatar] : avatars[playerInfo?.avatar]}
        />
        <DarkModeWrapper>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/profileEditPage" element={<ProfileEditPage playerInfo={isDemoMode ? demoUser : playerInfo} currentAuthenticatedUser={currentAuthenticatedUser} signOut={signOut} setPlayerInfo={setPlayerInfo} />} />
            <Route path="/carsStore" element={<CarsStore playerInfo={isDemoMode ? demoUser : playerInfo} money={isDemoMode ? demoUser?.money : money} setMoney={setMoney} />} />
            <Route path="/auctions" element={<AuctionPage playerInfo={isDemoMode ? demoUser : playerInfo} money={isDemoMode ? demoUser?.money : money} setMoney={setMoney} />} />
            <Route path="/myCars" element={<MyCars playerInfo={isDemoMode ? demoUser : playerInfo} money={isDemoMode ? demoUser?.money : money} setMoney={setMoney} />} />
            <Route path="/auctionsHub" element={<AuctionsHub />} />
            <Route path="/myBids" element={<MyBids playerInfo={isDemoMode ? demoUser : playerInfo} money={isDemoMode ? demoUser?.money : money} setMoney={setMoney} />} />
            <Route path="/myAuctions" element={<MyAuctions playerInfo={isDemoMode ? demoUser : playerInfo} money={isDemoMode ? demoUser?.money : money} setMoney={setMoney} />} />
            <Route path="/achievements" element={<AchievementList userId={isDemoMode ? demoUser?.id : playerInfo?.id} />} />
            <Route path="/paymentError" element={<PaymentError />} />
            <Route path="/store" element={<Store email={isDemoMode ? demoUser?.email : playerInfo?.email} />} />
            <Route path="/settings" element={<GameSettings playerInfo={isDemoMode ? demoUser : playerInfo} />} />
            <Route path="/musicUpload" element={<MusicUploadPage />} />
            <Route path="/musicLibraryPage" element={<MusicLibraryPage />} />
            <Route path="/user/:id" element={<UserPage />} />
            <Route path="/messenger" element={<MessengerPage />} />
            <Route path="/messenger/:conversationId" element={<MessengerPage />} />
          </Routes>
        </DarkModeWrapper>
      </main>
      <MusicPlayer />
    </Provider>
  );
};

const AppContentWrapper = ({ playerInfo, money, setMoney, currentAuthenticatedUser, signOut, setPlayerInfo }) => {
  const { isDemoMode } = useDemoMode();
  const navigate = useNavigate();

  // If user is authenticated, show app with full functionality
  if (playerInfo) {
    return (
      <AppContent 
        playerInfo={playerInfo}
        money={money}
        setMoney={setMoney}
        currentAuthenticatedUser={currentAuthenticatedUser}
        signOut={signOut}
        setPlayerInfo={setPlayerInfo}
      />
    );
  }

  // If demo mode is enabled and no authenticated user, show app with demo functionality
  if (isDemoMode) {
    return (
      <AppContent 
        playerInfo={null}
        money={null}
        setMoney={() => {}}
        currentAuthenticatedUser={() => {}}
        signOut={() => {}}
        setPlayerInfo={() => {}}
      />
    );
  }

  // Show login screen if not authenticated and not in demo mode
  if (!playerInfo) {
    return (
      <div className="auth-wrapper" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        <video
          autoPlay
          loop
          muted
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: -1
          }}
        >
          <source src={backgrounds[Math.floor(Math.random() * backgrounds.length)]} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div style={{
          position: "absolute", 
          top: 0, 
          left: 0, 
          width: "100%", 
          height: "100%", 
          backgroundColor: "rgba(0, 0, 0, 0.5)", 
          zIndex: -1 
        }}></div>
        <AuthComponent 
          onAuthSuccess={() => {}} 
          currentAuthenticatedUser={currentAuthenticatedUser}
        />
      </div>
    );
  }
};

export default function App() {
  const [isNewUser, setIsNewUser] = useState(false);
  const [playerInfo, setPlayerInfo] = useState(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [creatingUser, setCreatingUser] = useState(false);
  const [money, setMoney] = useState();


  useEffect(() => {
    if (playerInfo?.id) {
      checkAndUpdateAchievements(playerInfo.id);
    }
  }, [playerInfo?.id, money]);

  const createNewPlayer = useCallback(async (user) => {
    if (!user?.email) return;
    
    try {
      console.log('createNewPlayer: Starting player creation for user:', user);
      setCreatingUser(true);
      
      // Check if user already exists in our database
      const { data: existingUsers, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email);
      
      if (fetchError) {
        console.error('Error checking for existing user:', fetchError);
      }
      
      if (existingUsers && existingUsers.length > 0) {
        const existingUser = existingUsers[0];
        setPlayerInfo(existingUser);
        setMoney(existingUser.money);
        localStorage.setItem("userInfo", JSON.stringify(existingUser));
        setLoading(false);
        return;
      }

      const randomAvatarNumber = Math.floor(Math.random() * 72) + 1;
      const randomAvatar = `avatar${randomAvatarNumber}`;
      
      const newUserData = {
        id: user.id, // Use Supabase auth user ID
        nickname: user.user_metadata?.full_name || user.email.split('@')[0],
        email: user.email,
        money: 100000,
        avatar: randomAvatar,
        bio: "",
        sold: [],
        total_cars_owned: 0,
        total_auctions_participated: 0,
        total_bids_placed: 0,
        total_spent: 0,
        total_auctions_won: 0,
        total_profit_earned: 0,
        is_mock: false
      };

      // Create the user in our database
      const { data: createdPlayer, error: createError } = await supabase
        .from('users')
        .insert([newUserData])
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        // If user already exists due to race condition, fetch them
        if (createError.code === '23505') { // Unique violation
          const { data: retryUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', user.email)
            .single();
          
          if (retryUser) {
            setPlayerInfo(retryUser);
            setMoney(retryUser.money);
            localStorage.setItem("userInfo", JSON.stringify(retryUser));
            return;
          }
        }
        throw createError;
      }

      if (createdPlayer) {
        // Fetch all cars from the backend
        const { data: availableCars, error: carsError } = await supabase
          .from('cars')
          .select('*')
          .lt('price', 100000);
        
        if (carsError) {
          console.error('Error fetching cars:', carsError);
        }
        
        let affordableCars = availableCars || [];
        
        // If no affordable cars found, add some default ones
        if (affordableCars.length === 0) {
          console.log("No affordable cars found in the database, creating defaults");
          const defaultCars = [
            { make: 'Toyota', model: 'Camry', year: 2022, price: 35000, type: 'COMMON' },
            { make: 'Honda', model: 'Civic', year: 2022, price: 28000, type: 'COMMON' },
            { make: 'Ford', model: 'Focus', year: 2021, price: 25000, type: 'COMMON' },
            { make: 'Mazda', model: 'MX-5', year: 2020, price: 32000, type: 'COMMON' },
            { make: 'Volkswagen', model: 'Golf GTI', year: 2021, price: 38000, type: 'COMMON' },
            { make: 'Chevrolet', model: 'Corvette C8', year: 2022, price: 80000, type: 'COMMON' },
            { make: 'BMW', model: '3 Series', year: 2021, price: 45000, type: 'RARE' },
            { make: 'Hyundai', model: 'Elantra', year: 2022, price: 26000, type: 'COMMON' }
          ];
          
          const { data: createdCars } = await supabase
            .from('cars')
            .insert(defaultCars)
            .select();
          
          if (createdCars) {
            affordableCars = createdCars;
          }
        }
        
        // If we have affordable cars, add 5 random ones to the user
        if (affordableCars.length > 0) {
          const carsToAdd = Math.min(5, affordableCars.length);
          const shuffledCars = [...affordableCars].sort(() => 0.5 - Math.random());
          const selectedCars = shuffledCars.slice(0, carsToAdd);
          
          // Add the selected cars to the user
          const userCarInserts = selectedCars.map(car => ({
            user_id: createdPlayer.id,
            car_id: car.id
          }));
          
          await supabase
            .from('user_cars')
            .insert(userCarInserts);
          
          // Update user's total_cars_owned count
          await supabase
            .from('users')
            .update({ total_cars_owned: selectedCars.length })
            .eq('id', createdPlayer.id);
        }
        
        setPlayerInfo(createdPlayer);
        setMoney(createdPlayer.money);
        localStorage.setItem("userInfo", JSON.stringify(createdPlayer));
      }
      
    } catch (error) {
      console.error("Error in createNewPlayer:", error);
      // Try to fetch user one more time
      const { data: finalUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single();
      
      if (finalUser) {
        setPlayerInfo(finalUser);
        setMoney(finalUser.money);
        localStorage.setItem("userInfo", JSON.stringify(finalUser));
      } else {
        console.error("Failed to create or find user:", error);
      }
    } finally {
      console.log('createNewPlayer: Finished, setting states to false');
      setCreatingUser(false);
      setLoading(false);
    }
  }, []);

  const currentAuthenticatedUser = useCallback(async () => {
    try {
      console.log('currentAuthenticatedUser: Starting user check...');
      const user = await getCurrentUser();
      console.log('currentAuthenticatedUser: Got user:', user);
      
      if (!user?.email) {
        console.log('currentAuthenticatedUser: No authenticated user, showing login screen');
        setLoading(false);
        return;
      }

      console.log('currentAuthenticatedUser: Setting email:', user.email);
      setEmail(user.email);

      console.log('currentAuthenticatedUser: Checking if user exists in database...');
      // Check if user exists in our database
      const { data: existingUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single();

      console.log('currentAuthenticatedUser: Database query result - existingUser:', existingUser, 'error:', error);

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('currentAuthenticatedUser: Error checking for existing user:', error);
      }

      const isNewUser = !existingUser;
      console.log('currentAuthenticatedUser: Is new user:', isNewUser);
      setIsNewUser(isNewUser);

      if (!existingUser) {
        console.log('currentAuthenticatedUser: Creating new player...');
        await createNewPlayer(user);
      } else {
        console.log('currentAuthenticatedUser: Using existing user, setting player info...');
        console.log('currentAuthenticatedUser: Setting playerInfo to:', existingUser);
        setPlayerInfo(existingUser);
        console.log('currentAuthenticatedUser: Setting money to:', existingUser?.money);
        setMoney(existingUser?.money);
        localStorage.setItem("userInfo", JSON.stringify(existingUser));
        console.log('currentAuthenticatedUser: Setting loading to false');
        setLoading(false);
      }
      console.log('currentAuthenticatedUser: Completed successfully');
    } catch (err) {
      console.error("currentAuthenticatedUser: Error fetching current authenticated user:", err);
      // If there's an error (like no authenticated user), set loading to false to show login screen
      console.log('currentAuthenticatedUser: Setting loading to false due to error');
      setLoading(false);
    }
  }, [createNewPlayer]);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change event:', event, 'session:', session?.user?.email);
        if (event === 'SIGNED_IN' && session?.user) {
          // Clear demo mode when user successfully signs in
          localStorage.setItem('demoMode', 'false');
          console.log('SIGNED_IN event detected, calling currentAuthenticatedUser...');
          await currentAuthenticatedUser();
        } else if (event === 'SIGNED_OUT') {
          console.log('SIGNED_OUT event detected');
          setPlayerInfo(null);
          setMoney(null);
          setEmail('');
          localStorage.removeItem('userInfo');
          setLoading(false);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [currentAuthenticatedUser]);

  useEffect(() => {
    // Always check for authentication first, regardless of demo mode
    // This ensures real users can sign in even if demo mode was previously enabled
    const initAuth = async () => {
      try {
        console.log('initAuth: Starting initial authentication check...');
        // Add timeout to prevent endless loading
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Authentication timeout')), 10000);
        });
        
        await Promise.race([currentAuthenticatedUser(), timeoutPromise]);
        console.log('initAuth: Authentication check completed');
      } catch (error) {
        console.error('Error in initial auth check:', error);
        setLoading(false); // Ensure loading stops even if auth fails
      }
    };
    
    initAuth();
    document.title = "Carsnipe Online";
  }, [currentAuthenticatedUser]);

  const handleExit = () => {
    if (window.electron?.quitApp) {
      window.electron.quitApp();
    } else {
      console.error("Electron quit functionality is not available.");
    }
  };

  if (loading || creatingUser) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <DemoModeProvider>
      <BrowserRouter>
        <BackspaceHandler />
        <div className="app-container">
          <AppContentWrapper 
            playerInfo={playerInfo}
            money={money}
            setMoney={setMoney}
            currentAuthenticatedUser={currentAuthenticatedUser}
            signOut={signOut}
            setPlayerInfo={setPlayerInfo}
          />
        </div>
      </BrowserRouter>
    </DemoModeProvider>
  );
}
