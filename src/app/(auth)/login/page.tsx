"use client";

import { useAuth } from "@/contexts/authContext";
import { loginSchema } from "@/lib/validation/authSchema";
import {
    Box,
    Button,
    Checkbox,
    Container,
    FormControlLabel,
    TextField,
    Typography,
    Link,
    Paper,
    InputAdornment,
    IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material"
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { safeParse } from "valibot";

const Login = () => {
    const theme = useTheme();
    const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const router = useRouter();

    const [formValues, setFormValues] = useState({
        firstName: "",
        lastName: "",
        password: "",
        email: "",
    });

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    }

    const handleFieldChange = (fieldName: keyof typeof formValues, value: string) => {
        setFormValues(prev => ({ ...prev, [fieldName]: value }));

        // Clear error for this field if it exists
        if (errors[fieldName]) {
            setErrors(prev => ({ ...prev, [fieldName]: undefined }));
        }

        // Clear general error when user starts typing
        if (errors.general) {
            setErrors(prev => ({ ...prev, general: undefined }));
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        const result = safeParse(loginSchema, { email: formValues.email, password: formValues.password });
        if (!result.success) {
            const fieldErrors: { [key: string]: string } = {};

            result.issues.forEach(issue => {
                const field = issue.path?.[0].key as string;

                fieldErrors[field] = issue.message;
            });
            setErrors(fieldErrors);
            return;
        }


        const success = await login({ email: formValues.email, password: formValues.password });
        if (success) {
            router.push('/profile');
        } else {
            setErrors({ general: "Invalid email or password" });

        }
    }



    return (
        <Container
            maxWidth={false}
            disableGutters
            sx={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: { xs: "flex-start", md: "center" },
                // background: `linear-gradient(-135deg, ${theme.palette.text.secondary}, ${theme.palette.background.default})`,
                backgroundImage: "url('/office.jpeg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "rgba(0,0,0,0.4)", // semi transparent overlay
                    zIndex: 1,
                },
            }}
        >
            <Paper
                elevation={6}
                sx={{
                    width: { xs: "85%", sm: "80%", md: 800 },
                    height: "auto",
                    maxHeight: { xs: "80vh", md: "75vh" },
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    borderRadius: {
                        xs: (theme.shape.borderRadius as number),        // small radius on mobile
                        sm: (theme.shape.borderRadius as number) * 1.5,  // medium
                        md: (theme.shape.borderRadius as number) * 2,    // larger radius on desktop
                    },
                    my: 'auto',
                    overflow: "hidden",
                    zIndex: 2, // ensure Paper is above overlay
                    backdropFilter: "blur(12px)",
                    background: "rgba(255, 255, 255, 0.85)", // semi-transparent white
                }}
            >
                {/* Left Side */}
                <Box
                    sx={{
                        flex: 1,
                        background: `linear-gradient(135deg, ${theme.palette.text.secondary}, ${theme.palette.background.default})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        color: theme.palette.secondary.main,
                        p: 4,
                    }}
                >
                    <Box display="flex" alignItems="center" gap={1}>
                        <Box
                            component="img"
                            src="/NextStepLogo.png"
                            alt="NextStep Logo"
                            sx={{ width: { xs: 40, md: 60 }, height: { xs: 40, md: 60 } }}
                        />
                        <Typography
                            variant={theme.breakpoints.down("sm") ? "h4" : "h2"}
                            fontWeight={theme.typography.h4.fontWeight}
                            color={theme.palette.text.primary}
                        >
                            Next
                        </Typography>
                        <Typography
                            variant={theme.breakpoints.down("sm") ? "h4" : "h2"}
                            fontWeight={theme.typography.h4.fontWeight}
                            // color={theme.palette.text.secondary}
                            color="#3b4957"
                        >
                            Step
                        </Typography>
                    </Box>
                    <Typography
                        variant="subtitle1"
                        mt={1}
                        // color={theme.palette.text.secondary}
                        color="#3b4957"
                    >
                        Your Path To Success
                    </Typography>
                </Box>

                {/* Right Side */}
                <Box
                    sx={{
                        flex: 1,
                        background: `${theme.palette.background.default}`,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        p: { xs: 3, md: 6 },
                    }}
                >
                    <Box sx={{ width: "100%", maxWidth: 350 }}>
                        <Typography
                            variant="h5"
                            fontWeight={theme.typography.h5.fontWeight}
                            mb={1}
                        >
                            Welcome Back
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={1}>
                            Login to continue
                        </Typography>
                        <form onSubmit={handleLogin}>
                            <TextField
                                label="Email"
                                onChange={(e) => handleFieldChange("email", e.target.value)}
                                error={Boolean(errors.email)}
                                helperText={errors.email}
                                fullWidth
                                margin="normal"
                                sx={{
                                    backgroundColor: `${theme.palette.background.default}`,
                                    borderRadius: 1,

                                }}
                            />
                            <TextField
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                onChange={(e) => handleFieldChange("password", e.target.value)}
                                error={Boolean(errors.password)}
                                helperText={errors.password}
                                fullWidth
                                margin="normal"
                                sx={{
                                    backgroundColor: `${theme.palette.background.default}`,
                                    borderRadius: 1,
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} edge="end">
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />

                            {/* <FormControlLabel control={
                                <Checkbox
                                    sx={{
                                        color: theme.palette.text.primary,
                                        "&.Mui-checked": {
                                            color: theme.palette.primary.main,
                                        },
                                    }}
                                />
                            } label="Remember me" /> */}

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                sx={{
                                    mt: 2,
                                    py: 1.2,
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontWeight: 600,
                                    boxShadow: "0px 4px 10px rgba(25, 118, 210, 0.3)",
                                    "&:hover": {
                                        boxShadow: "0px 6px 14px rgba(25, 118, 210, 0.4)",
                                    },
                                }}
                            >
                                Sign in
                            </Button>
                        </form>

                        <Typography variant="body2" mt={2}>
                            Don't have an account?{" "}
                            <Link href="/signup" underline="hover">
                                Sign Up
                            </Link>
                        </Typography>
                        <Typography variant="body2" mt={2}>
                            <Link href="/company/login" underline="hover">
                                Company Login
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}

export default Login


