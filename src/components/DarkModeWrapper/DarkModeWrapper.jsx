import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import "./darkModeWrapper.css";
import { useLocation } from 'react-router-dom';
import { handleKeyDown, setLocation } from '../../redux/slices/focusSlice';

export const DarkModeWrapper = ({ children }) => {
    const { darkMode } = useSelector((state) => state.quickSettings);
    const { focusedZone, currentFocusedElement, currentRoute } = useSelector((state) => state.focus);
    const dispatch = useDispatch();
    const location = useLocation();

    useEffect(() => {
        const mainContainer = document.body;
        if (!mainContainer) return;

        if (darkMode) {
            mainContainer.classList.add('dark-mode');
        } else {
            mainContainer.classList.remove('dark-mode');
        }

        return () => {
            if (mainContainer) {
                mainContainer.classList.remove('dark-mode');
            }
        };
    }, [darkMode]);

    const keyDownHandler = useCallback((event) => {
        dispatch(handleKeyDown(event.key));
    }, [dispatch]);

    useEffect(() => {
        dispatch(setLocation(location.pathname));
    }, [location.pathname, dispatch]);

    useEffect(() => {
        window.addEventListener('keydown', keyDownHandler);
        return () => {
            window.removeEventListener('keydown', keyDownHandler);
        };
    }, [keyDownHandler]);

    return (
        <div id="darkModeWrapper">
            {children}
        </div>
    );
};