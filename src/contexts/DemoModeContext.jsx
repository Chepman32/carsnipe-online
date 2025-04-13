import React, { createContext, useContext, useState, useEffect } from 'react';

const DemoModeContext = createContext();

export const useDemoMode = () => useContext(DemoModeContext);

export const DemoModeProvider = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(localStorage.getItem('demoMode') === 'true');

  const [demoUser, setDemoUser] = useState(() => {
    const storedUser = localStorage.getItem('demoUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Listen for storage events to update the demoUser state
  // This ensures all components using the demoUser state are updated
  // when the demoUser is updated in localStorage from another component
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'demoUser' && isDemoMode) {
        try {
          const updatedUser = JSON.parse(localStorage.getItem('demoUser'));
          if (updatedUser) {
            setDemoUser(updatedUser);
            console.log('Demo user updated from storage event:', updatedUser);
          }
        } catch (error) {
          console.error('Error parsing demoUser from localStorage:', error);
        }
      } else if (event.key === 'demoMode') {
        const newDemoMode = localStorage.getItem('demoMode') === 'true';
        setIsDemoMode(newDemoMode);
        
        if (!newDemoMode) {
          setDemoUser(null);
        } else if (newDemoMode && !demoUser) {
          const storedUser = localStorage.getItem('demoUser');
          if (storedUser) {
            try {
              setDemoUser(JSON.parse(storedUser));
            } catch (error) {
              console.error('Error parsing demoUser from localStorage:', error);
            }
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
      // Always create a fresh demo user when entering demo mode
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
      localStorage.setItem('demoUser', JSON.stringify(newDemoUser));
      console.log('Demo mode enabled with user:', newDemoUser);
    } else {
      // Clear demo data when exiting demo mode
      localStorage.removeItem('demoUser');
      setDemoUser(null);
      console.log('Demo mode disabled');
    }
  };

  // Add a function to update the demo user
  const updateDemoUser = (updatedUserData) => {
    if (isDemoMode && demoUser) {
      const updatedUser = { ...demoUser, ...updatedUserData };
      setDemoUser(updatedUser);
      localStorage.setItem('demoUser', JSON.stringify(updatedUser));
      
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