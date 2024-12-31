import React, { useEffect } from 'react'
import { useSelector } from 'react-redux';
import "./darkModeWrapper.css"

export const DarkModeWrapper = ({ children }) => {
    const { darkMode } = useSelector((state) => state.quickSettings);

    useEffect(() => {
        const mainContainer = document.body
        if (!mainContainer) return;  // Guard clause if not found
      
        if (darkMode) {
          mainContainer.classList.add('dark-mode');
        } else {
          mainContainer.classList.remove('dark-mode');
        }
      
        // Optional cleanup:
        return () => {
          if (mainContainer) {
            mainContainer.classList.remove('dark-mode');
          }
        };
      }, [darkMode]);
    return (
        <div id="darkModeWrapper">
            {children}
        </div>
    )
}