"use client";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";
import { AuthProvider } from "./contexts/authContext";
import { CompanyAuthProvider } from "./contexts/companyAuthContext";


export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <CompanyAuthProvider>
          {children}
        </CompanyAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
