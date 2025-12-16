// AuthContext.tsx - Fixed AsyncStorage error
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  customerId: string | null;
  setCustomerId: (id: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  customerId: null,
  setCustomerId: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Start with no customer selected; will be set after login
  const [customerId, setCustomerId] = useState<string | null>(null);

  const handleSetCustomerId = async (id: string) => {
    // ✅ Only store if id is valid (not null/undefined)
    if (id && id !== 'null' && id !== 'undefined') {
      setCustomerId(id);
      try {
        await AsyncStorage.setItem('@customer_id', id);
        console.log('✅ CustomerId stored:', id);
      } catch (error) {
        console.error('❌ Error storing customerId:', error);
      }
    } else {
      console.log('⚠️ Skipping storage of invalid customerId:', id);
    }
  };

  return (
    <AuthContext.Provider value={{ customerId, setCustomerId: handleSetCustomerId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);