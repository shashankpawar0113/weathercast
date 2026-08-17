import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type SpotlightCardType =
  | 'hero'
  | 'hourly'
  | 'chart'
  | 'weekly'
  | 'wind'
  | 'sun'
  | 'uv'
  | 'humidity'
  | 'pressure'
  | 'visibility'
  | 'clouds'
  | 'rain'
  | null;

interface SpotlightContextType {
  activeCard: SpotlightCardType;
  openSpotlight: (card: SpotlightCardType) => void;
  closeSpotlight: () => void;
}

const SpotlightContext = createContext<SpotlightContextType | undefined>(undefined);

export const SpotlightProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeCard, setActiveCard] = useState<SpotlightCardType>(null);

  const openSpotlight = useCallback((card: SpotlightCardType) => {
    setActiveCard(card);
  }, []);

  const closeSpotlight = useCallback(() => {
    setActiveCard(null);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSpotlight();
      }
    };

    if (activeCard) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeCard, closeSpotlight]);

  return (
    <SpotlightContext.Provider value={{ activeCard, openSpotlight, closeSpotlight }}>
      {children}
    </SpotlightContext.Provider>
  );
};

export const useSpotlight = () => {
  const context = useContext(SpotlightContext);
  if (!context) {
    throw new Error('useSpotlight must be used within a SpotlightProvider');
  }
  return context;
};
