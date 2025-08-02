import React, { useState, useEffect, useRef } from 'react';
import { getCarImageUrl, getAvatarUrl, getAchievementUrl } from '../config/assets';

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = '/src/assets/images/placeholder.png',
  type = 'image', // 'image', 'car', 'avatar', 'achievement'
  carName = null,
  avatarName = null,
  achievementName = null,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Determine the actual image source
  const getImageSrc = () => {
    if (src) return src;
    
    switch (type) {
      case 'car':
        return getCarImageUrl(carName);
      case 'avatar':
        return getAvatarUrl(avatarName);
      case 'achievement':
        return getAchievementUrl(achievementName);
      default:
        return src;
    }
  };

  const imageSrc = getImageSrc();

  useEffect(() => {
    // Intersection Observer for lazy loading
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before the image comes into view
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setError(true);
    setIsLoaded(true);
  };

  return (
    <div 
      ref={imgRef}
      className={`lazy-image-container ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#f0f0f0', // Light gray placeholder
        minHeight: '100px'
      }}
    >
      {isInView && (
        <img
          src={error ? placeholder : imageSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
          }}
          {...props}
        />
      )}
      
      {!isLoaded && isInView && (
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#999',
            fontSize: '12px'
          }}
        >
          Loading...
        </div>
      )}
    </div>
  );
};

export default LazyImage; 