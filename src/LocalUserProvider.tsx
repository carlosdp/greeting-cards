import { useState, useEffect, createContext, useContext } from 'react';

const LocalUserContext = createContext<string | null>(null);

// a provider that provides a user token, and randomly generates one if it is not already stored in LocalStorage
export const LocalUserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('userToken');
    if (storedToken) {
      setUserToken(storedToken);
    } else {
      const newToken = Math.random().toString(36).slice(2);
      localStorage.setItem('userToken', newToken);
      setUserToken(newToken);
    }
  }, []);

  return <LocalUserContext.Provider value={userToken}>{children}</LocalUserContext.Provider>;
};

export const useLocalUser = () => {
  const userToken = useContext(LocalUserContext);
  if (userToken === undefined) {
    throw new Error('useLocalUser must be used within a LocalUserProvider');
  }

  return userToken;
};
