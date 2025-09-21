"use client";

import { createContext, useContext, useEffect, ReactNode, useState } from "react";

import { useRouter } from "next/navigation";
import { getCookie, deleteCookie, setCookie } from "cookies-next";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { loginCompany, registerCompany } from "../lib/api/companyAPI";
import { Company, CompanyLoginCredentials, CompanyRegisterCredentials } from "@/types/Company";

interface CompanyAuthContextType {
  company: Company | null;
  loading: boolean;
  login: (credentials: CompanyLoginCredentials) => Promise<boolean>;
  register: (credentials: CompanyRegisterCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => void;
}

const CompanyAuthContext = createContext<CompanyAuthContextType | undefined>(undefined);

export function CompanyAuthProvider({ children }: { children: ReactNode }) {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const checkAuth = () => {
    try {
      const companyData = getCookie("companyData");
      if (companyData) {
        const parsed = typeof companyData === "string" ? JSON.parse(companyData) : companyData;
        setCompany(parsed);
      } else {
        setCompany(null);
      }
    } catch (error) {
      console.error("Error parsing company data:", error);
      deleteCookie("companyData");
      deleteCookie("companyToken");
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: CompanyLoginCredentials): Promise<boolean> => {
    try {
      const response = await loginCompany(credentials);
      if (response) {
        //Check if company is approved
        if (response.company.status === 'pending') {
          toast.error('Your company registration is pending approval ');
          return false;
        }
        if (response.company.status === 'rejected') {
          toast.error('Your company registration was rejected ');
          return false;
        }
        if (response.company.status === 'suspended') {
          toast.error('Your company account has been suspended ');
          return false;
        }
        if (response.company.status === 'approved') {

          setCookie("companyToken", response.data, { maxAge: 60 * 60 * 24 });
          setCookie("companyData", JSON.stringify(response.company), { maxAge: 60 * 60 * 24 });
          setCompany(response.company);
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  };

  const register = async (credentials: CompanyRegisterCredentials): Promise<boolean> => {
    try {
      const response = await registerCompany(credentials);
      if (response) {
        // setCookie("companyToken", response.data, { maxAge: 60 * 60 * 24 });
        // setCookie("companyData", JSON.stringify(response.company), { maxAge: 60 * 60 * 24 });
        // setCompany(response.company);
        // toast.success("Company registered successfully");
        // setError("");
        // return true;
        // DON'T REDIRECT TO DASHBOARD - WAIT FOR APPROVAL
        toast.success('Company registration submitted for approval.');
        return true;
      }
       return false;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        setError(error.response?.data?.message || "Company registration failed");
      } else {
        setError("Unexpected error occurred");
      }
      toast.error("Company registration failed", { className: "error-toast" });
      return false;
    }
  };

  const logout = async () => {
    router.push("/company/login");
    deleteCookie("companyToken");
    deleteCookie("companyData");
    setCompany(null);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <CompanyAuthContext.Provider value={{ company, loading, login, register, logout, checkAuth }}>
      {children}
    </CompanyAuthContext.Provider>
  );
}

export function useCompanyAuth() {
  const context = useContext(CompanyAuthContext);
  if (context === undefined) {
    throw new Error("useCompanyAuth must be used within a CompanyAuthProvider");
  }
  return context;
}
