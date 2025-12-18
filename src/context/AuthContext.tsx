// AuthContext.tsx - Fixed AsyncStorage error
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
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
  // await AsyncStorage.setItem('user', JSON.stringify(normalizedUser));



  useEffect(() => {
    const loadCustomerId = async () => {
      try {
        const storedId = await AsyncStorage.getItem('@customer_id');

        if (storedId && storedId !== 'null' && storedId !== 'undefined') {
          setCustomerId(storedId);
          console.log('✅ CustomerId restored:', storedId);
        }
      } catch (error) {
        console.log('❌ Error restoring customerId', error);
      }
    };

    loadCustomerId();
  }, []);

  const handleSetCustomerId = async (id: string) => {
    if (id && id !== 'null' && id !== 'undefined') {
      setCustomerId(id);
      await AsyncStorage.setItem('@customer_id', id);
    }
  };

  return (
    <AuthContext.Provider
      value={{ customerId, setCustomerId: handleSetCustomerId }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
