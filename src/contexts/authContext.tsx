"use client";

import { createContext, useContext, useEffect, ReactNode, useState } from 'react';
import { User, LoginCredentials, RegisterCredentials } from '../types/User';
import { useRouter } from 'next/navigation';
import { getCookie, deleteCookie, setCookie } from 'cookies-next';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import { loginUser, registerUser } from '../lib/api/userAPI';
import { mutate } from 'swr';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const checkAuth = () => {
    try {
      const userData = getCookie('userData');

      if (userData) {
        const user = typeof userData === 'string' ? JSON.parse(userData) : userData;
        setUser(user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      // Clear corrupted data
      deleteCookie('userData');
      deleteCookie('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await loginUser(credentials);

      if (response) {
        setCookie('token', response.data, { maxAge: 60 * 60 * 24 });
        setCookie('userData', JSON.stringify(response.user), { maxAge: 60 * 60 * 24 });
        setUser(response.user);

        if (response.user.role === "admin") {
          router.push('/admin/dashboard');
        } else {
          router.push('/user/dashboard');
        }
        return { success: true };
      }
      return { success: false, message: "Unexpected login failure" };
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return { success: false, message: error.response?.data?.message || "Invalid credentials" };
      }
      return { success: false, message: "Something went wrong" };
    }
  };


  const register = async (credentials: RegisterCredentials): Promise<boolean> => {
    try {
      const response = await registerUser(credentials);
      if (response) {
        //Store token and user data in cookies (client side)
        setCookie('token', response.data, { maxAge: 60 * 60 * 24 });
        setCookie('userData', JSON.stringify(response.user), { maxAge: 60 * 60 * 24 });
        setUser(response.user);
        toast.success("New User Created");
        setError('');

        // Redirect based on user role
        if (response.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard/profile');
        }
        return true;
      }
      return false;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        setError(error.response?.data?.message || 'registration failed');
      } else {
        setError('An unexpected error occurred');
      }
      toast.error("Registration failed", { className: 'error-toast' });
      return false;
    }
  };

  const logout = async () => {
    // Navigate FIRST - user still sees current page
    window.location.href='/login';

    // THEN cleanup after navigation starts (in next tick)
    // This prevents the dashboard from breaking during transition
    setTimeout(() => {
      // Clear user state
      setUser(null);

      // Clear cookies
      deleteCookie('token');
      deleteCookie('userData');
      setUser(null);

      // Clear all SWR cache
      mutate(
        () => true,           // Match all keys
        undefined,            // Clear data
        { revalidate: false } // Don't refetch
      );

      // Show success message
      toast.success("Logged out successfully");
    }, 50); // Small delay ensures navigation has started
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}