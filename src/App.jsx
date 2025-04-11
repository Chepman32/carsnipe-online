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
      <div className="app-container">
        {!playerInfo ? (
          <div className="auth-wrapper" style={{ backgroundColor: "#000000", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ThemeProvider theme={theme}>
              <Authenticator 
                components={customComponents} 
                formFields={customFormFields} 
                socialProviders={["google"]}
              />
            </ThemeProvider>
          </div>
        ) : (
          <Provider store={store}>
            <main>
              <CustomHeader 
                money={money} 
                nickname={playerInfo.nickname} 
                avatar={avatars[playerInfo.avatar]}
              />
              <DarkModeWrapper>
                <Routes>
                  <Route path="/" element={<MainPage />} />
                  <Route path="/profileEditPage" element={<ProfileEditPage playerInfo={playerInfo} currentAuthenticatedUser={currentAuthenticatedUser} signOut={signOut} setPlayerInfo={setPlayerInfo} />} />
                  <Route path="/carsStore" element={<CarsStore playerInfo={playerInfo} money={money} setMoney={setMoney} />} />
                  <Route path="/auctions" element={<AuctionPage playerInfo={playerInfo} money={money} setMoney={setMoney} />} />
                  <Route path="/myCars" element={<MyCars playerInfo={playerInfo} money={money} setMoney={setMoney} />} />
                  <Route path="/auctionsHub" element={<AuctionsHub />} />
                  <Route path="/myBids" element={<MyBids playerInfo={playerInfo} money={money} setMoney={setMoney} />} />
                  <Route path="/myAuctions" element={<MyAuctions playerInfo={playerInfo} money={money} setMoney={setMoney} />} />
                  <Route path="/achievements" element={<AchievementList userId={playerInfo.id} />} />
                  <Route path="/paymentError" element={<PaymentError />} />
                  <Route path="/store" element={<Store email={playerInfo.email} />} />
                  <Route path="/settings" element={<GameSettings playerInfo={playerInfo} />} />
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
        )}
      </div>
    </BrowserRouter>
  );
}