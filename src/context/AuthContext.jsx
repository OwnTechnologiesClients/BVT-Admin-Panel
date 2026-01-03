"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authAPI, getUser, getToken, setUser, setToken, removeToken } from "@/lib/api";

const AuthContext = createContext(null);

// Helper to get initials from name
const getInitials = (firstName, lastName) => {
  const first = firstName?.charAt(0)?.toUpperCase() || "";
  const last = lastName?.charAt(0)?.toUpperCase() || "";
  return first + last;
};

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = getUser();
        const token = getToken();
        
        if (storedUser && token) {
          setUserState(storedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        removeToken();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      const response = await authAPI.login(email, password);
      
      if (response.success && response.data) {
        const userData = response.data.user;
        setUserState(userData);
        setIsAuthenticated(true);
        return { success: true, data: response.data };
      }
      
      throw new Error(response.message || "Login failed");
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.message || "Login failed. Please check your credentials.",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUserState(null);
      setIsAuthenticated(false);
      removeToken();
    }
  }, []);

  // Get user profile
  const fetchProfile = useCallback(async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.success && response.data) {
        setUserState(response.data.user);
        setUser(response.data.user);
        return response.data;
      }
    } catch (error) {
      console.error("Fetch profile error:", error);
      // If profile fetch fails, logout user
      logout();
    }
  }, [logout]);

  // Computed user object with avatar initials
  const userWithAvatar = useMemo(() => {
    if (!user) return null;
    
    return {
      ...user,
      avatarInitials: getInitials(user.firstName, user.lastName),
      name: user.fullName || `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      title: user.role === "admin" 
        ? "Platform Administrator" 
        : user.profile?.department 
          ? `${user.profile.department} Instructor`
          : "Instructor",
    };
  }, [user]);

  const value = useMemo(() => {
    return {
      user: userWithAvatar,
      role: user?.role || null,
      isAuthenticated,
      loading,
      login,
      logout,
      fetchProfile,
    };
  }, [userWithAvatar, user?.role, isAuthenticated, loading, login, logout, fetchProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

