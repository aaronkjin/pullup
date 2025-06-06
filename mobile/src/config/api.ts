import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_CONFIG = {
  baseURL: 'https://tnovv4gbcf.execute-api.us-west-1.amazonaws.com/dev',
  
  timeout: 10000,
  
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Auth token management
export const AuthTokenManager = {
  // Store auth token
  setToken: async (token: string) => {
    try {
      await AsyncStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Error storing auth token:', error);
    }
  },

  // Get auth token
  getToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error retrieving auth token:', error);
      return null;
    }
  },

  // Remove auth token
  removeToken: async () => {
    try {
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      console.error('Error removing auth token:', error);
    }
  },
};

export const CAS_CONFIG = {
  loginUrl: 'https://login.stanford.edu/cas/login',
  logoutUrl: 'https://login.stanford.edu/cas/logout',
  serviceUrl: 'https://your-domain.com/auth/callback',
}; 