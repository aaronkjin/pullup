import React, { createContext, useContext, ReactNode } from "react";
import { AuthTokenManager } from "../config/api";

interface UserInfo {
  firstName?: string;
  lastName?: string;
  email?: string;
  userType?: "student" | "organization";
}

interface UserContextType {
  userInfo: UserInfo | null;
  setUserInfo: (userInfo: UserInfo | null) => void;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
  userInfo: UserInfo | null;
  setUserInfo: (userInfo: UserInfo | null) => void;
  setIsAuthenticated?: (isAuthenticated: boolean) => void;
}

export const UserProvider: React.FC<UserProviderProps> = ({
  children,
  userInfo,
  setUserInfo,
  setIsAuthenticated,
}) => {
  const logout = async () => {
    try {
      await AuthTokenManager.removeToken();
      setUserInfo(null);
      if (setIsAuthenticated) {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
