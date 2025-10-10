"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        primary: {
            main: "#1976d2", // Blue for Sign in button
        },
        secondary: {
            main: "#A1B7C1",
        },
        background: {
            //   default: "#DBE4E9",
            default: "#ffffff",
        },
        text: {
            primary: "#01225d",
            secondary: "#576a7d",
        },
    },
    typography: {
        fontFamily: `"Inter", "Roboto", "Helvetica", "Arial", sans-serif`,
        h4: {
            fontWeight: 700,
        },
        h5: {
            fontWeight: 600,
        },
        body1: {
            fontSize: "1rem",
        },
        body2: {
            fontSize: "0.9rem",
        },
    },
    shape: {
        borderRadius: 5,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    borderRadius: 8,
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& input:-webkit-autofill': {
                        WebkitBoxShadow: '0 0 0 1000px #ffffff inset !important',
                        WebkitTextFillColor: '#000000 !important',
                        transition: 'background-color 5000s ease-in-out 0s',
                    },
                    '& input:-webkit-autofill:hover': {
                        WebkitBoxShadow: '0 0 0 1000px #ffffff inset !important',
                        WebkitTextFillColor: '#000000 !important',
                    },
                    '& input:-webkit-autofill:focus': {
                        WebkitBoxShadow: '0 0 0 1000px #ffffff inset !important',
                        WebkitTextFillColor: '#000000 !important',
                    },
                    '& input:-webkit-autofill:active': {
                        WebkitBoxShadow: '0 0 0 1000px #ffffff inset !important',
                        WebkitTextFillColor: '#000000 !important',
                    },
                }

            },
        }
    }
});

export default theme;
