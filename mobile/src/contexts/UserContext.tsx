import React, { createContext, useContext, ReactNode } from "react";

interface UserInfo {
  firstName?: string;
  lastName?: string;
  email?: string;
  userType?: "student" | "organization";
}

interface UserContextType {
  userInfo: UserInfo | null;
  setUserInfo: (userInfo: UserInfo | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
  userInfo: UserInfo | null;
  setUserInfo: (userInfo: UserInfo | null) => void;
}

export const UserProvider: React.FC<UserProviderProps> = ({
  children,
  userInfo,
  setUserInfo,
}) => {
  return (
    <UserContext.Provider value={{ userInfo, setUserInfo }}>
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
