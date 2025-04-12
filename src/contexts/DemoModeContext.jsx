import React, { createContext, useContext, useState, useEffect } from 'react';

const DemoModeContext = createContext();

export const useDemoMode = () => useContext(DemoModeContext);

export const DemoModeProvider = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(localStorage.getItem('demoMode') === 'true');

  const [demoUser, setDemoUser] = useState(() => {
    const storedUser = localStorage.getItem('demoUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });

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

  return (
    <DemoModeContext.Provider value={{ isDemoMode, demoUser, toggleDemoMode }}>
      {children}
    </DemoModeContext.Provider>
  );
}; 