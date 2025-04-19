import React, { useCallback, useEffect, useState } from "react";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";
import { getCurrentUser, signOut as amplifySignOut, fetchAuthSession } from "aws-amplify/auth";
// Hub is no longer needed for signIn event
import {
  Authenticator,
  useTheme,
  useAuthenticator,
  View,
  Image,
  Text,
  Button,
  Heading,
  ThemeProvider,
} from "@aws-amplify/ui-react";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { Spin } from "antd";
import { Provider } from "react-redux";
import store from "./redux/store";
import MusicPlayer from "./components/MusicPlayer/MusicPlayer";
import { listUsers } from "./graphql/queries";
import { createUser } from "./graphql/mutations";
import "@aws-amplify/ui-react/styles.css";
import awsExports from "./aws-exports";
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
import { checkAndUpdateAchievements, extractNameFromEmail } from "./functions";
import AchievementList from "./pages/AchievementList/AchievementList";
import { MainPage } from "./pages/MainPage/MainPage";
import "./AuthStyles.css"; // Styles for the Authenticator wrapper
import "./App.css"; // General app styles
import MusicUploadPage from "./pages/MusicUploadPage/MusicUploadPage";
import MusicLibraryPage from "./pages/MusicLibraryPage/MusicLibraryPage";
import GameSettings from "./pages/GameSettings/GameSettings";
import UserPage from "./pages/UserPage/UserPage";
import MessengerPage from "./pages/MessengerPage/MessengerPage";
import { DarkModeWrapper } from "./components/DarkModeWrapper/DarkModeWrapper";
import { avatars } from "./avatars";
import { DemoModeProvider, useDemoMode } from "./contexts/DemoModeContext";

const client = generateClient();
Amplify.configure(awsExports);

// --- Helper Components (Unchanged) ---

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

const DemoModeButton = () => {
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  const handleDemoMode = () => {
    try {
      toggleDemoMode();
      // Use a small timeout to ensure state is updated before redirecting/reloading
      setTimeout(() => {
        window.location.href = '/'; // Force reload to apply demo mode correctly
      }, 100);
    } catch (error) {
      console.error('Error in demo mode toggle:', error);
    }
  };

  return (
    <Button
      variation="primary"
      onClick={handleDemoMode}
      style={{
        marginTop: '1.5rem',
        width: '100%',
        padding: '0.75rem',
        fontSize: '1rem',
        fontWeight: 'bold'
      }}
    >
      {isDemoMode ? 'Exit Demo Mode' : 'Try Demo Mode'}
    </Button>
  );
};

// --- Authenticator Customization (Unchanged, but DemoModeProvider added around Footer) ---

const customComponents = {
  Header() {
    const { tokens } = useTheme();
    return (
      <View textAlign="center" padding={tokens.space.medium}>
        <Image alt="Carsnipe Logo" src={require("./assets/images/Logo.png")} width="160px" />
      </View>
    );
  },
  SignIn: {
    Header() {
      const { tokens } = useTheme();
      return (
        <View textAlign="center" padding={tokens.space.medium}>
          <Heading level={3} padding={tokens.space.small}>
            Welcome
          </Heading>
          <Text color={tokens.colors.neutral}>
            Log in to Carsnipe Online to continue.
          </Text>
        </View>
      );
    },
    Footer() {
      const { tokens } = useTheme();
      const { toForgotPassword, toSignUp } = useAuthenticator();
      // Wrap Footer content in DemoModeProvider to give DemoModeButton context
      return (
        <DemoModeProvider>
          <View textAlign="center" padding={tokens.space.medium}>
            <View paddingBottom={tokens.space.medium}>
              <Button
                fontWeight="normal"
                onClick={toForgotPassword}
                size="small"
                variation="link"
              >
                Forgot password?
              </Button>
            </View>
            <Text color={tokens.colors.neutral}>
              Don't have an account?{" "}
              <Button
                fontWeight="normal"
                onClick={toSignUp}
                size="small"
                variation="link"
              >
                Sign up
              </Button>
            </Text>
            <DemoModeButton />
          </View>
        </DemoModeProvider>
      );
    }
  },
  SocialProviders: {
    CustomSocialProvider() {
      const { tokens } = useTheme();
      return (
        <View textAlign="center" paddingTop={tokens.space.small}>
          <View
            backgroundColor={tokens.colors.neutral}
            height="1px"
            width="100%"
            position="relative"
            marginBottom={tokens.space.medium}
          >
            <Text
              position="absolute"
              top="-10px"
              left="50%"
              transform="translateX(-50%)"
              backgroundColor={tokens.colors.background.primary}
              paddingLeft={tokens.space.small}
              paddingRight={tokens.space.small}
            >
              OR
            </Text>
          </View>
        </View>
      );
    }
  }
};

const customFormFields = {
  signIn: {
    username: {
      placeholder: "Email address",
      label: "Email address",
      type: "email"
    },
    password: {
      placeholder: "Password",
      label: "Password"
    }
  }
};

const theme = {
  name: 'Auth0Theme',
  tokens: {
    colors: {
      brand: {
        primary: {
          80: '#2684FF',
          90: '#0066EE',
          100: '#0052CC',
        },
      },
    },
    components: {
      authenticator: {
        router: {
          borderWidth: '0px',
          boxShadow: 'none',
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          minHeight: '550px',
        },
      },
      button: {
        primary: {
          backgroundColor: '#2684FF',
          _hover: {
            backgroundColor: '#0066EE',
          },
        },
      },
    },
  },
};

// --- Main Application Content Component ---
// This component renders the core UI of the application.
const AppContent = ({ playerInfo, money, setMoney, signOut, setPlayerInfo }) => {
  const { isDemoMode, demoUser } = useDemoMode(); // Get demo mode state

  // Determine which user data to use (real or demo)
  const currentMoney = isDemoMode && demoUser ? demoUser.money : money;
  const currentNickname = isDemoMode && demoUser ? demoUser.nickname : playerInfo?.nickname;
  const currentAvatar = isDemoMode && demoUser ? avatars[demoUser.avatar] : avatars[playerInfo?.avatar];
  const currentUserId = isDemoMode && demoUser ? demoUser.id : playerInfo?.id;
  const currentUserEmail = isDemoMode && demoUser ? demoUser.email : playerInfo?.email;
  const currentUserInfo = isDemoMode && demoUser ? demoUser : playerInfo;

  return (
    <Provider store={store}>
      <main>
        <CustomHeader
          money={currentMoney}
          nickname={currentNickname}
          avatar={currentAvatar}
        />
        <DarkModeWrapper>
          <Routes>
            <Route path="/" element={<MainPage />} />
            {/* Pass down relevant props, including signOut and setPlayerInfo for ProfileEditPage */}
            <Route path="/profileEditPage" element={<ProfileEditPage playerInfo={currentUserInfo} signOut={signOut} setPlayerInfo={setPlayerInfo} />} />
            <Route path="/carsStore" element={<CarsStore playerInfo={currentUserInfo} money={currentMoney} setMoney={setMoney} />} />
            <Route path="/auctions" element={<AuctionPage playerInfo={currentUserInfo} money={currentMoney} setMoney={setMoney} />} />
            <Route path="/myCars" element={<MyCars playerInfo={currentUserInfo} money={currentMoney} setMoney={setMoney} />} />
            <Route path="/auctionsHub" element={<AuctionsHub />} />
            <Route path="/myBids" element={<MyBids playerInfo={currentUserInfo} money={currentMoney} setMoney={setMoney} />} />
            <Route path="/myAuctions" element={<MyAuctions playerInfo={currentUserInfo} money={currentMoney} setMoney={setMoney} />} />
            <Route path="/achievements" element={<AchievementList userId={currentUserId} />} />
            <Route path="/paymentError" element={<PaymentError />} />
            <Route path="/store" element={<Store email={currentUserEmail} />} />
            <Route path="/settings" element={<GameSettings playerInfo={currentUserInfo} />} />
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


// --- Authenticated Application Logic ---
// This component handles fetching/creating user data AFTER authentication succeeds.
const AuthenticatedApp = ({ user, signOut }) => {
  const [playerInfo, setPlayerInfo] = useState(null);
  const [money, setMoney] = useState();
  const [loading, setLoading] = useState(true);
  const [creatingUser, setCreatingUser] = useState(false);
  const { isDemoMode } = useDemoMode(); // Check demo mode status

  // Function to create a new player if one doesn't exist
  const createNewPlayer = useCallback(async (email, nickname) => {
    if (!email) return;
    setCreatingUser(true);
    try {
      const existingUsersResponse = await client.graphql({
        query: listUsers,
        variables: { filter: { email: { eq: email } } }
      });
      const existingUsers = existingUsersResponse?.data?.listUsers?.items || [];

      if (existingUsers.length > 0) {
        const existingUser = existingUsers[0];
        setPlayerInfo(existingUser);
        setMoney(existingUser.money);
        localStorage.setItem("userInfo", JSON.stringify(existingUser));
        return existingUser; // Return the found user
      }

      const randomAvatarNumber = Math.floor(Math.random() * 72) + 1;
      const randomAvatar = `avatar${randomAvatarNumber}`;
      const newUserData = {
        nickname: extractNameFromEmail(nickname) || nickname || email.split('@')[0],
        email,
        money: 100000,
        bidded: [],
        avatar: randomAvatar,
        bio: "",
        achievements: [],
        sold: []
      };

      const createdPlayer = await client.graphql({
        query: createUser,
        variables: { input: newUserData }
      });

      const newUser = createdPlayer?.data?.createUser;
      if (newUser) {
        setPlayerInfo(newUser);
        setMoney(newUser.money);
        localStorage.setItem("userInfo", JSON.stringify(newUser));
        return newUser; // Return the created user
      } else {
         // Handle potential creation errors or race conditions
         console.error("Failed to create user, attempting refetch...");
         const retryFetch = await client.graphql({
            query: listUsers,
            variables: { filter: { email: { eq: email } } }
          });
          const retryUser = retryFetch?.data?.listUsers?.items[0];
          if (retryUser) {
            setPlayerInfo(retryUser);
            setMoney(retryUser.money);
            localStorage.setItem("userInfo", JSON.stringify(retryUser));
            return retryUser;
          } else {
            throw new Error("User creation failed and user not found on refetch.");
          }
      }
    } catch (error) {
      console.error("Error in createNewPlayer:", error);
       // Final check in case of errors
       const finalCheck = await client.graphql({
        query: listUsers,
        variables: { filter: { email: { eq: email } } }
      });
      const finalUser = finalCheck?.data?.listUsers?.items[0];
      if (finalUser) {
        setPlayerInfo(finalUser);
        setMoney(finalUser.money);
        localStorage.setItem("userInfo", JSON.stringify(finalUser));
        return finalUser;
      } else {
         console.error("Failed to create or find user after error:", error);
         // Potentially sign out or show an error message
         await signOut(); // Sign out if user data cannot be established
         return null;
      }
    } finally {
      setCreatingUser(false);
    }
  }, [signOut]); // Add signOut dependency

  // Function to fetch or create the user profile based on the authenticated user
  const fetchOrCreateUserProfile = useCallback(async () => {
    if (!user) return; // Should not happen if rendered inside Authenticator

    setLoading(true);
    try {
      const session = await fetchAuthSession();
      let userEmail = '';
      let userNickname = '';

      // Extract email and nickname from ID token (preferred) or user attributes
      if (session?.tokens?.idToken?.payload) {
        const idToken = session.tokens.idToken.payload;
        userEmail = idToken.email || '';
        userNickname = idToken.name || idToken.given_name || userEmail.split('@')[0];
      } else if (user?.signInDetails?.loginId) { // Fallback for Cognito username/email
         userEmail = user.signInDetails.loginId;
         userNickname = userEmail.split('@')[0]; // Basic nickname from email
      } else if (user?.attributes?.email) { // Fallback for user attributes
         userEmail = user.attributes.email;
         userNickname = user.attributes.name || user.attributes.given_name || userEmail.split('@')[0];
      }


      if (!userEmail) {
        throw new Error("Could not retrieve user email from authenticated session.");
      }

      // Check if user exists in DB
      const playersData = await client.graphql({
        query: listUsers,
        variables: { filter: { email: { eq: userEmail } } }
       });
      const existingUser = playersData?.data?.listUsers?.items[0];

      if (existingUser) {
        setPlayerInfo(existingUser);
        setMoney(existingUser.money);
        localStorage.setItem("userInfo", JSON.stringify(existingUser));
      } else {
        // User doesn't exist, create them
        await createNewPlayer(userEmail, userNickname);
      }
    } catch (err) {
      console.error("Error fetching/creating user profile:", err);
      // Handle error appropriately, maybe sign out
       await signOut();
    } finally {
      setLoading(false);
    }
  }, [user, createNewPlayer, signOut]); // Add signOut dependency

  // Fetch/create profile when the component mounts or user changes
  useEffect(() => {
    if (!isDemoMode) { // Only run if not in demo mode
        fetchOrCreateUserProfile();
    } else {
        setLoading(false); // Stop loading if in demo mode
    }
  }, [fetchOrCreateUserProfile, isDemoMode]);

  // Update achievements when playerInfo or money changes
  useEffect(() => {
    if (playerInfo?.id && !isDemoMode) {
      checkAndUpdateAchievements(playerInfo.id);
    }
  }, [playerInfo?.id, money, isDemoMode]);

  // Show loading spinner while fetching/creating profile
  if (loading || creatingUser) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  // Render the main app content once playerInfo is available or if in demo mode
  if (playerInfo || isDemoMode) {
    return (
      <AppContent
        playerInfo={playerInfo}
        money={money}
        setMoney={setMoney}
        signOut={signOut} // Pass signOut down
        setPlayerInfo={setPlayerInfo} // Pass setPlayerInfo down
      />
    );
  }

  // Fallback case (should ideally not be reached if loading/error handling is correct)
  return (
     <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: 'red' }}>
        Error loading user profile. Please try refreshing.
     </div>
  );
};


// --- App Router Component ---
// This component contains the main routing and conditional logic based on demo mode.
// It's rendered inside DemoModeProvider, so useDemoMode can be called here.
const AppRouter = () => {
  const { isDemoMode } = useDemoMode(); // Now called safely within the provider's context

  return (
    <div className="app-container">
      {/* Conditional rendering based on demo mode */}
      {isDemoMode ? (
        // Render AppContent directly in demo mode (no authentication needed)
        <AppContent
          playerInfo={null} // Demo user data is handled inside AppContent
          money={null}
          setMoney={() => {}}
          signOut={() => { // Provide a dummy signOut for demo mode if needed
            console.log("Attempted sign out in demo mode");
          }}
          setPlayerInfo={() => {}}
        />
      ) : (
        // Render Authenticator for normal mode
        <div className="auth-wrapper" style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          padding: "20px 0"
        }}>
          {/* Video Background */}
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
            <source src="/videos/video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Dark Overlay */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: -1
          }}></div>
          {/* Authenticator Component */}
          <ThemeProvider theme={theme}>
            <Authenticator
              components={customComponents}
              formFields={customFormFields}
              socialProviders={["google"]}
            >
              {/* Render Prop: Content shown AFTER successful authentication */}
              {({ signOut: amplifySignOutProp, user }) => (
                <AuthenticatedApp user={user} signOut={amplifySignOutProp} />
              )}
            </Authenticator>
          </ThemeProvider>
        </div>
      )}
    </div>
  );
};

// --- Root App Component ---
export default function App() {
  // Handle app exit for Electron (can remain here or move if needed)
  const handleExit = () => {
    if (window.electron?.quitApp) {
      window.electron.quitApp();
    } else {
      console.error("Electron quit functionality is not available.");
    }
  };

  // Set document title
  useEffect(() => {
    document.title = "Carsnipe Online";
  }, []);

  return (
    <BrowserRouter>
      <BackspaceHandler />
      {/* DemoModeProvider now wraps the AppRouter */}
      <DemoModeProvider>
        <AppRouter />
      </DemoModeProvider>
    </BrowserRouter>
  );
}
