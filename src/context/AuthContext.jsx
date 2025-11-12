"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

const MOCK_PROFILES = {
  admin: {
    role: "admin",
    name: "Ava Delgado",
    email: "admin@bvt-training.com",
    avatarInitials: "AD",
    title: "Platform Administrator",
  },
  instructor: {
    role: "instructor",
    name: "Commander Sarah Johnson",
    email: "sarah.johnson@navy.mil",
    avatarInitials: "SJ",
    title: "Navigation Systems Instructor",
    department: "Navigation",
  },
};

export const AuthProvider = ({ children }) => {
  const [activeRole, setActiveRole] = useState("admin");

  const setRoleValue = useCallback(
    (role) => {
      if (MOCK_PROFILES[role]) {
        setActiveRole(role);
      }
    },
    [setActiveRole]
  );

  const toggleRole = useCallback(() => {
    setActiveRole((prev) => (prev === "admin" ? "instructor" : "admin"));
  }, []);

  const value = useMemo(() => {
    const user = MOCK_PROFILES[activeRole];

    return {
      user,
      role: activeRole,
      availableRoles: Object.keys(MOCK_PROFILES),
      setRole: setRoleValue,
      toggleRole,
    };
  }, [activeRole, setRoleValue, toggleRole]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

