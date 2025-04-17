import React, { useCallback, useEffect, useState } from "react";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";
import { getCurrentUser, signOut, fetchAuthSession } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
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
  defaultTheme
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
import { checkAndUpdateAchievements, extractNameFromEmail, selectAvatar } from "./functions";
import AchievementList from "./pages/AchievementList/AchievementList";
import { MainPage } from "./pages/MainPage/MainPage";
import "./AuthStyles.css";
import MusicUploadPage from "./pages/MusicUploadPage/MusicUploadPage";
import MusicLibraryPage from "./pages/MusicLibraryPage/MusicLibraryPage";
import GameSettings from "./pages/GameSettings/GameSettings";
import UserPage from "./pages/UserPage/UserPage";
import MessengerPage from "./pages/MessengerPage/MessengerPage";
import { DarkModeWrapper } from "./components/DarkModeWrapper/DarkModeWrapper";
import { avatars } from "./avatars";
import { DemoModeProvider, useDemoMode } from "./contexts/DemoModeContext";
import VideoBackground from "./assets/Intro.mp4"

const client = generateClient();
Amplify.configure(awsExports);

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
      console.log('Demo mode button clicked, current state:', isDemoMode);
      toggleDemoMode();
      console.log('Demo mode toggled, new state:', !isDemoMode);
      
      // Use a small timeout to ensure state is updated before redirecting
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    } catch (error) {
      console.error('Error in demo mode toggle:', error);
    }
  };

  return (
    <Button
      variation="primary"
      onClick={handleDemoMode}
      style={{ marginTop: '1rem', width: '100%' }}
    >
      {isDemoMode ? 'Exit Demo Mode' : 'Try Demo Mode'}
    </Button>
  );
};

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
      return (
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

const AppContent = ({ playerInfo, money, setMoney, currentAuthenticatedUser, signOut, setPlayerInfo }) => {
  const { isDemoMode, demoUser } = useDemoMode();

  return (
    <Provider store={store}>
      <main>
        <CustomHeader 
          money={isDemoMode && demoUser ? demoUser.money : money} 
          nickname={isDemoMode && demoUser ? demoUser.nickname : playerInfo?.nickname} 
          avatar={isDemoMode && demoUser ? avatars[demoUser.avatar] : avatars[playerInfo?.avatar]}
        />
        <DarkModeWrapper>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/profileEditPage" element={<ProfileEditPage playerInfo={isDemoMode && demoUser ? demoUser : playerInfo} currentAuthenticatedUser={currentAuthenticatedUser} signOut={signOut} setPlayerInfo={setPlayerInfo} />} />
            <Route path="/carsStore" element={<CarsStore playerInfo={isDemoMode && demoUser ? demoUser : playerInfo} money={isDemoMode && demoUser ? demoUser.money : money} setMoney={setMoney} />} />
            <Route path="/auctions" element={<AuctionPage playerInfo={isDemoMode && demoUser ? demoUser : playerInfo} money={isDemoMode && demoUser ? demoUser.money : money} setMoney={setMoney} />} />
            <Route path="/myCars" element={<MyCars playerInfo={isDemoMode && demoUser ? demoUser : playerInfo} money={isDemoMode && demoUser ? demoUser.money : money} setMoney={setMoney} />} />
            <Route path="/auctionsHub" element={<AuctionsHub />} />
            <Route path="/myBids" element={<MyBids playerInfo={isDemoMode && demoUser ? demoUser : playerInfo} money={isDemoMode && demoUser ? demoUser.money : money} setMoney={setMoney} />} />
            <Route path="/myAuctions" element={<MyAuctions playerInfo={isDemoMode && demoUser ? demoUser : playerInfo} money={isDemoMode && demoUser ? demoUser.money : money} setMoney={setMoney} />} />
            <Route path="/achievements" element={<AchievementList userId={isDemoMode && demoUser ? demoUser.id : playerInfo?.id} />} />
            <Route path="/paymentError" element={<PaymentError />} />
            <Route path="/store" element={<Store email={isDemoMode && demoUser ? demoUser.email : playerInfo?.email} />} />
            <Route path="/settings" element={<GameSettings playerInfo={isDemoMode && demoUser ? demoUser : playerInfo} />} />
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
          <source src={VideoBackground} type="video/mp4" />
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
        <ThemeProvider theme={theme}>
          <Authenticator 
            components={customComponents} 
            formFields={customFormFields} 
            socialProviders={["google"]}
          />
        </ThemeProvider>
      </div>
    );
  }

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

  const createNewPlayer = useCallback(async (email, nickname) => {
    if (!email) return;
    
    try {
      setCreatingUser(true);
      
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
        setLoading(false);
        return;
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

      try {
        const createdPlayer = await client.graphql({
          query: createUser,
          variables: { input: newUserData }
        });

        if (createdPlayer?.data?.createUser) {
          const newUser = createdPlayer.data.createUser;
          setPlayerInfo(newUser);
          setMoney(newUser.money);
          localStorage.setItem("userInfo", JSON.stringify(newUser));
        }
      } catch (creationError) {
        if (creationError.errors?.some(e => e.message.includes('duplicate') || e.message.includes('unique'))) {
          const retryFetch = await client.graphql({
            query: listUsers,
            variables: { filter: { email: { eq: email } } }
          });
          
          const retryUser = retryFetch?.data?.listUsers?.items[0];
          if (retryUser) {
            setPlayerInfo(retryUser);
            setMoney(retryUser.money);
            localStorage.setItem("userInfo", JSON.stringify(retryUser));
            return;
          }
        }
        throw creationError;
      }
      
    } catch (error) {
      console.error("Error in createNewPlayer:", error);
      const finalCheck = await client.graphql({
        query: listUsers,
        variables: { filter: { email: { eq: email } } }
      });
      
      const finalUser = finalCheck?.data?.listUsers?.items[0];
      if (finalUser) {
        setPlayerInfo(finalUser);
        setMoney(finalUser.money);
        localStorage.setItem("userInfo", JSON.stringify(finalUser));
      } else {
        console.error("Failed to create or find user:", error);
      }
    } finally {
      setCreatingUser(false);
      setLoading(false);
    }
  }, []);

  const currentAuthenticatedUser = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      const session = await fetchAuthSession();
      
      let userEmail = '';
      let userNickname = '';
      let provider = '';

      if (session?.tokens?.idToken?.payload) {
        const idToken = session.tokens.idToken.payload;
        userEmail = idToken.email || '';
        userNickname = idToken.name || idToken.given_name || userEmail.split('@')[0];
        provider = idToken.iss.includes('google') ? 'Google' : 'Cognito';
      } else if (user.signInDetails) {
        userEmail = user.signInDetails.loginId;
        userNickname = userEmail;
        provider = 'Cognito';
      }

      if (!userEmail) {
        throw new Error("Could not retrieve user email");
      }

      setEmail(userEmail);

      const playersData = await client.graphql({ query: listUsers });
      const playersList = playersData?.data?.listUsers.items;
      const existingUser = playersList.find((u) => u?.email === userEmail);

      const isNewUser = !existingUser;
      setIsNewUser(isNewUser);

      if (!existingUser) {
        await createNewPlayer(userEmail, userNickname);
      } else {
        setPlayerInfo(existingUser);
        setMoney(existingUser?.money);
        localStorage.setItem("userInfo", JSON.stringify(existingUser));
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching current authenticated user:", err);
      setLoading(false);
    }
  }, [createNewPlayer]);

  const listener = useCallback(async (data) => {
    const { payload } = data;
    if (payload.event === 'signIn') {
      await currentAuthenticatedUser();
    }
  }, [currentAuthenticatedUser]);

  useEffect(() => {
    const unsubscribe = Hub.listen("auth", listener);
    return () => unsubscribe();
  }, [listener]);

  useEffect(() => {
    currentAuthenticatedUser();
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
    <BrowserRouter>
      <BackspaceHandler />
      <DemoModeProvider>
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
      </DemoModeProvider>
    </BrowserRouter>
  );
}