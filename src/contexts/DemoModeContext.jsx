import React, { createContext, useContext, useState, useEffect } from 'react';

const DemoModeContext = createContext();
const DEMO_USER_STORAGE_KEY = 'CARSNIPE_DEMO_MODE_USER_t876345';

export const useDemoMode = () => useContext(DemoModeContext);

export const DemoModeProvider = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(localStorage.getItem('demoMode') === 'true');
  
  // Helper function to create a new demo user
  const createNewDemoUser = () => {
    const newDemoUser = {
      id: 'demo-user',
      email: 'demo@carsnipe.online',
      nickname: 'Demo User',
      money: 1000000,
      avatar: 'avatar1',
      bio: 'Demo mode user',
      bidded: [],
      sold: [],
      achievements: []
    };
    setDemoUser(newDemoUser);
    localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(newDemoUser));
    console.log('New demo user created:', newDemoUser);
  };

  // Define demoUser state
  const [demoUser, setDemoUser] = useState(null);

  // Initialize demoUser on component mount
  useEffect(() => {
    // If demo mode is active, we need to ensure we have a demo user
    if (isDemoMode) {
      const storedUser = localStorage.getItem(DEMO_USER_STORAGE_KEY);
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setDemoUser(parsedUser);
          console.log('Demo user initialized from localStorage:', parsedUser);
        } catch (error) {
          console.error(`Error parsing demo user from localStorage (${DEMO_USER_STORAGE_KEY}):`, error);
          createNewDemoUser();
        }
      } else {
        createNewDemoUser();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this runs once on mount

  // Listen for storage events to update the demoUser state
  // This ensures all components using the demoUser state are updated
  // when the demoUser is updated in localStorage from another component
  // Effect to ensure demoUser is set correctly when isDemoMode changes
  useEffect(() => {
    if (isDemoMode && !demoUser) {
      // If we're in demo mode but don't have a demo user, try to load from localStorage
      const storedUser = localStorage.getItem(DEMO_USER_STORAGE_KEY);
      if (storedUser) {
        try {
          setDemoUser(JSON.parse(storedUser));
          console.log('Demo user loaded from localStorage:', JSON.parse(storedUser));
        } catch (error) {
          console.error(`Error parsing demo user from localStorage (${DEMO_USER_STORAGE_KEY}):`, error);
          createNewDemoUser();
        }
      } else {
        // No stored user, create a new one
        createNewDemoUser();
      }
    } else if (!isDemoMode) {
      // If we're not in demo mode, clear the demo user from state
      setDemoUser(null);
    }
  }, [isDemoMode, demoUser]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === DEMO_USER_STORAGE_KEY && isDemoMode) {
        try {
          const updatedUser = JSON.parse(localStorage.getItem(DEMO_USER_STORAGE_KEY));
          if (updatedUser) {
            setDemoUser(updatedUser);
            console.log('Demo user updated from storage event:', updatedUser);
          }
        } catch (error) {
          console.error(`Error parsing demo user from localStorage (${DEMO_USER_STORAGE_KEY}):`, error);
        }
      } else if (event.key === 'demoMode') {
        const newDemoMode = localStorage.getItem('demoMode') === 'true';
        setIsDemoMode(newDemoMode);
        
        if (!newDemoMode) {
          setDemoUser(null);
        } else if (newDemoMode && !demoUser) {
          const storedUser = localStorage.getItem(DEMO_USER_STORAGE_KEY);
          if (storedUser) {
            try {
              setDemoUser(JSON.parse(storedUser));
            } catch (error) {
              console.error(`Error parsing demo user from localStorage (${DEMO_USER_STORAGE_KEY}):`, error);
              createNewDemoUser();
            }
          } else {
            createNewDemoUser();
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom storage event dispatched within the same window
    window.addEventListener('storage-update', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage-update', handleStorageChange);
    };
  }, [isDemoMode, demoUser]);

  const toggleDemoMode = () => {
    const newDemoMode = !isDemoMode;
    setIsDemoMode(newDemoMode);
    localStorage.setItem('demoMode', newDemoMode.toString());
    
    if (newDemoMode) {
      // Check if we already have a demo user in localStorage
      const existingDemoUser = localStorage.getItem(DEMO_USER_STORAGE_KEY);
      
      if (existingDemoUser) {
        // Use existing demo user data
        try {
          const parsedUser = JSON.parse(existingDemoUser);
          setDemoUser(parsedUser);
          console.log('Demo mode enabled with existing user:', parsedUser);
        } catch (error) {
          console.error(`Error parsing existing demo user from localStorage (${DEMO_USER_STORAGE_KEY}):`, error);
          // If parsing fails, create a new demo user
          createNewDemoUser();
        }
      } else {
        // Create a new demo user if none exists
        createNewDemoUser();
      }
    } else {
      // When exiting demo mode, keep the data in localStorage but clear from state
      setDemoUser(null);
      console.log('Demo mode disabled, but user data preserved in localStorage');
    }
  };

  // Add a function to update the demo user
  const updateDemoUser = (updatedUserData) => {
    if (isDemoMode && demoUser) {
      const updatedUser = { ...demoUser, ...updatedUserData };
      setDemoUser(updatedUser);
      localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(updatedUser));
      
      // Dispatch a custom event to notify other components
      window.dispatchEvent(new Event('storage-update'));
      
      console.log('Demo user updated:', updatedUser);
      return updatedUser;
    }
    return demoUser;
  };

  return (
    <DemoModeContext.Provider value={{ isDemoMode, demoUser, toggleDemoMode, updateDemoUser }}>
      {children}
    </DemoModeContext.Provider>
  );
}; 