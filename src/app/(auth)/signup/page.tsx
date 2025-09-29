"use client";

import {
    Box,
    Button,
    Checkbox,
    Container,
    TextField,
    Typography,
    Link,
    Paper,
    InputAdornment,
    IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/authContext";
import { safeParse } from "valibot";
import { signupSchema } from "@/lib/validation/authSchema";
import { Delete, Visibility, VisibilityOff } from "@mui/icons-material"


const SignUp = () => {
    const theme = useTheme();
    const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
    const [showSignupPassword, setShowSignupPassword] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const { register } = useAuth();
    const router = useRouter();

    const [formValues, setFormValues] = useState({
        firstName: "",
        lastName: "",
        password: "",
        email: "",
    });

    const handleClickShowSignupPassword = () => {
        setShowSignupPassword(!showSignupPassword);
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

    // Handle file selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setErrors({ ...errors, image: "Please select an image file" });
                return;
            }

            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                setErrors({ ...errors, image: "Image size must be less than 5MB" });
                return;
            }

            setImageFile(file);
            setErrors(prev => ({ ...prev, image: undefined }));

        }
    }

    // Remove selected Image
    const handleRemoveImage = () => {
        setImageFile(null);
        setErrors(prev => ({ ...prev, image: undefined }));
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();

        const result = safeParse(signupSchema, { firstName: formValues.firstName, lastName: formValues.lastName, password: formValues.password, image: imageFile, email: formValues.email });
        if (!result.success) {
            const fieldErrors: { [key: string]: string } = {};

            result.issues.forEach(issue => {
                const field = issue.path?.[0].key as string;

                fieldErrors[field] = issue.message;
            });
            setErrors(fieldErrors);
            return;
        }

        try {
            if (!imageFile) {
                setErrors({ ...errors, image: "Profile image is required" });
                return;
            }
            const success = await register({
                firstName: formValues.firstName,
                lastName: formValues.lastName,
                password: formValues.password,
                email: formValues.email,
                profilePicture: imageFile
            });

            if (success) {
                router.push('/user/dashboard');
            } else {
                setErrors({ general: "Registration failed" });
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setErrors({ general: err.message });
            } else {
                setErrors({ general: "An error occurred during registration" });
            }
        }
    }

    return (
        <Container
            maxWidth={false}
            disableGutters
            sx={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: { xs: "flex-start", md: "center" },
                overflowY: "auto",
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
                    minHeight: { xs: "auto", md: 600 },
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    borderRadius: {
                        xs: (theme.shape.borderRadius as number),        // small radius on mobile
                        sm: (theme.shape.borderRadius as number) * 1.5,  // medium
                        md: (theme.shape.borderRadius as number) * 2,    // larger radius on desktop
                    },
                    mt: 5,
                    mb: 5,
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
                    <Box sx={{ width: "100%", maxWidth: 320, px: 1 }}>
                        <Typography
                            variant="h5"
                            fontWeight={theme.typography.h5.fontWeight}
                            mb={2}
                            mt={5}
                        >
                            Sign Up
                        </Typography>

                        <form onSubmit={handleSignUp}>
                            <TextField
                                label="First Name"
                                fullWidth
                                size="small"
                                sx={{
                                    backgroundColor: `${theme.palette.background.default}`,
                                    borderRadius: 1,
                                    mb: 2,
                                    mt: 2,
                                }}
                                value={formValues.firstName}
                                onChange={(e) => handleFieldChange("firstName", e.target.value)}
                                error={Boolean(errors.firstName)}
                                helperText={errors.firstName}

                            />
                            <TextField
                                label="Last Name"
                                fullWidth
                                size="small"
                                sx={{
                                    backgroundColor: `${theme.palette.background.default}`,
                                    borderRadius: 1,
                                    mb: 2

                                }}
                                value={formValues.lastName}
                                onChange={(e) => handleFieldChange("lastName", e.target.value)}
                                error={Boolean(errors.lastName)}
                                helperText={errors.lastName}

                            />
                            <TextField
                                label="Email"
                                fullWidth
                                size="small"
                                sx={{
                                    backgroundColor: `${theme.palette.background.default}`,
                                    borderRadius: 1,
                                    mb: 2

                                }}
                                value={formValues.email}
                                onChange={(e) => handleFieldChange("email", e.target.value)}
                                error={Boolean(errors.email)}
                                helperText={errors.email}

                            />
                            <TextField
                                label="Password"
                                type={showSignupPassword ? "text" : "password"}
                                fullWidth
                                size="small"
                                sx={{
                                    backgroundColor: `${theme.palette.background.default}`,
                                    borderRadius: 1,
                                    mb: 2

                                }}
                                value={formValues.password}
                                onChange={(e) => handleFieldChange("password", e.target.value)}
                                error={Boolean(errors.password)}
                                helperText={errors.password}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton aria-label="toggle password visibility" onClick={handleClickShowSignupPassword} edge="end">
                                                {showSignupPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}

                            />

                            <Box sx={{ mt: 2, mb: 2 }}>
                                <Typography variant="body2">
                                    Profile Image
                                </Typography>
                                {imageFile ? (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2, mb: 2 }}>
                                        <Typography variant="body2" color={theme.palette.text.primary}>
                                            {imageFile.name} ({(imageFile.size / 1024).toFixed(2)} KB)
                                        </Typography>
                                        <IconButton
                                            color="error"
                                            onClick={handleRemoveImage}
                                            size="small"
                                        >
                                            <Delete />
                                        </IconButton>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: "flex", alignItems: 'center', mt: 2, gap: 2 }}>
                                        <Button
                                            variant='outlined'
                                            component="label"
                                            color="primary"
                                            startIcon={<PhotoCamera />}
                                            sx={{ minWidth: 200 }}>
                                            Choose Image
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                        </Button>
                                    </Box>
                                )}

                                {errors.image && (
                                    <Typography variant="caption" color="error">
                                        {errors.image}
                                    </Typography>
                                )}
                            </Box>
                            <Button
                                variant="contained"
                                fullWidth
                                type="submit"
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
                                Sign Up
                            </Button>
                        </form>

                        <Typography variant="body2" mt={2} mb={5}>
                            Already have an account?{" "}
                            <Link href="/login" underline="hover">
                                Sign In
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Container >
    );
}

export default SignUp


