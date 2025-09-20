// "use client";

// import {
//     Box,
//     Button,
//     Checkbox,
//     Container,
//     TextField,
//     Typography,
//     Link,
//     Paper,
//     InputAdornment,
//     IconButton,
// } from "@mui/material";
// import { useTheme } from "@mui/material/styles";
// import PhotoCamera from "@mui/icons-material/PhotoCamera";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/contexts/authContext";
// import { safeParse } from "valibot";
// import { signupSchema } from "@/lib/validation/authSchema";
// import { Delete, Visibility, VisibilityOff } from "@mui/icons-material"


// const SignUp = () => {
//     const theme = useTheme();
//     const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
//     const [showSignupPassword, setShowSignupPassword] = useState(false);
//     const [imageFile, setImageFile] = useState<File | null>(null);

//     const { register } = useAuth();
//     const router = useRouter();

//     const [formValues, setFormValues] = useState({
//         firstName: "",
//         lastName: "",
//         password: "",
//         email: "",
//     });

//     const handleClickShowSignupPassword = () => {
//         setShowSignupPassword(!showSignupPassword);
//     }

//     const handleFieldChange = (fieldName: keyof typeof formValues, value: string) => {
//         setFormValues(prev => ({ ...prev, [fieldName]: value }));

//         // Clear error for this field if it exists
//         if (errors[fieldName]) {
//             setErrors(prev => ({ ...prev, [fieldName]: undefined }));
//         }

//         // Clear general error when user starts typing
//         if (errors.general) {
//             setErrors(prev => ({ ...prev, general: undefined }));
//         }
//     };

//     // Handle file selection
//     const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0];
//         if (file) {
//             // Validate file type
//             if (!file.type.startsWith('image/')) {
//                 setErrors({ ...errors, image: "Please select an image file" });
//                 return;
//             }

//             // Validate file size (5MB limit)
//             if (file.size > 5 * 1024 * 1024) {
//                 setErrors({ ...errors, image: "Image size must be less than 5MB" });
//                 return;
//             }

//             setImageFile(file);
//             setErrors(prev => ({ ...prev, image: undefined }));

//         }
//     }

//     // Remove selected Image
//     const handleRemoveImage = () => {
//         setImageFile(null);
//         setErrors(prev => ({ ...prev, image: undefined }));
//     }

//     const handleSignUp = async (e: React.FormEvent) => {
//         e.preventDefault();

//         const result = safeParse(signupSchema, { firstName: formValues.firstName, lastName: formValues.lastName, password: formValues.password, image: imageFile, email: formValues.email });
//         if (!result.success) {
//             const fieldErrors: { [key: string]: string } = {};

//             result.issues.forEach(issue => {
//                 const field = issue.path?.[0].key as string;

//                 fieldErrors[field] = issue.message;
//             });
//             setErrors(fieldErrors);
//             return;
//         }

//         try {
//             if (!imageFile) {
//                 setErrors({ ...errors, image: "Profile image is required" });
//                 return;
//             }
//             const success = await register({
//                 firstName: formValues.firstName,
//                 lastName: formValues.lastName,
//                 password: formValues.password,
//                 email: formValues.email,
//                 profilePicture: imageFile
//             });

//             if (success) {
//                 router.push('/');
//             } else {
//                 setErrors({ general: "Registration failed" });
//             }
//         } catch (err: unknown) {
//             if (err instanceof Error) {
//                 setErrors({ general: err.message });
//             } else {
//                 setErrors({ general: "An error occurred during registration" });
//             }
//         }
//     }

//     return (
//         <Container
//             maxWidth={false}
//             disableGutters
//             sx={{
//                 minHeight: "100vh",
//                 display: "flex",
//                 justifyContent: "center",
//                 alignItems: { xs: "flex-start", md: "center" },
//                 overflowY: "auto",
//                 // background: `linear-gradient(-135deg, ${theme.palette.text.secondary}, ${theme.palette.background.default})`,
//                 backgroundImage: "url('/office.jpeg')",
//                 backgroundSize: "cover",
//                 backgroundPosition: "center",
//                 position: "relative",
//                 "&::before": {
//                     content: '""',
//                     position: "absolute",
//                     top: 0,
//                     left: 0,
//                     width: "100%",
//                     height: "100%",
//                     background: "rgba(0,0,0,0.4)", // semi transparent overlay
//                     zIndex: 1,
//                 },
//             }}
//         >
//             <Paper
//                 elevation={6}
//                 sx={{
//                     width: { xs: "85%", sm: "80%", md: 800 },
//                     height: { xs: "auto", md: 600 },
//                     display: "flex",
//                     flexDirection: { xs: "column", md: "row" },
//                     borderRadius: {
//                         xs: (theme.shape.borderRadius as number),        // small radius on mobile
//                         sm: (theme.shape.borderRadius as number) * 1.5,  // medium
//                         md: (theme.shape.borderRadius as number) * 2,    // larger radius on desktop
//                     },
//                     mt: 5,
//                     mb: 5,
//                     overflow: "hidden",
//                     zIndex: 2, // ensure Paper is above overlay
//                     backdropFilter: "blur(12px)",
//                     background: "rgba(255, 255, 255, 0.85)", // semi-transparent white
//                 }}
//             >
//                 {/* Left Side */}
//                 <Box
//                     sx={{
//                         flex: 1,
//                         background: `linear-gradient(135deg, ${theme.palette.text.secondary}, ${theme.palette.background.default})`,
//                         backgroundSize: "cover",
//                         backgroundPosition: "center",
//                         display: "flex",
//                         flexDirection: "column",
//                         justifyContent: "center",
//                         alignItems: "center",
//                         color: theme.palette.secondary.main,
//                         p: 4,
//                     }}
//                 >
//                     <Box display="flex" alignItems="center" gap={1}>
//                         <Box
//                             component="img"
//                             src="/NextStepLogo.png"
//                             alt="NextStep Logo"
//                             sx={{ width: { xs: 40, md: 60 }, height: { xs: 40, md: 60 } }}
//                         />
//                         <Typography
//                             variant={theme.breakpoints.down("sm") ? "h4" : "h2"}
//                             fontWeight={theme.typography.h4.fontWeight}
//                             color={theme.palette.text.primary}
//                         >
//                             Next
//                         </Typography>
//                         <Typography
//                             variant={theme.breakpoints.down("sm") ? "h4" : "h2"}
//                             fontWeight={theme.typography.h4.fontWeight}
//                             // color={theme.palette.text.secondary}
//                             color="#3b4957"
//                         >
//                             Step
//                         </Typography>
//                     </Box>
//                     <Typography
//                         variant="subtitle1"
//                         mt={1}
//                         // color={theme.palette.text.secondary}
//                         color="#3b4957"
//                     >
//                         Your Path To Success
//                     </Typography>
//                 </Box>

//                 {/* Right Side */}
//                 <Box
//                     sx={{
//                         flex: 1,
//                         background: `${theme.palette.background.default}`,
//                         display: "flex",
//                         justifyContent: "center",
//                         alignItems: "center",
//                         p: { xs: 3, md: 6 },
//                     }}
//                 >
//                     <Box sx={{ width: "100%", maxWidth: 320, px: 1 }}>
//                         <Typography
//                             variant="h5"
//                             fontWeight={theme.typography.h5.fontWeight}
//                             mb={2}
//                             mt={5}
//                         >
//                             Sign Up
//                         </Typography>

//                         <form onSubmit={handleSignUp}>
//                             <TextField
//                                 label="First Name"
//                                 fullWidth
//                                 size="small"
//                                 sx={{
//                                     backgroundColor: `${theme.palette.background.default}`,
//                                     borderRadius: 1,
//                                     mb: 2,
//                                     mt: 2,
//                                 }}
//                                 value={formValues.firstName}
//                                 onChange={(e) => handleFieldChange("firstName", e.target.value)}
//                                 error={Boolean(errors.firstName)}
//                                 helperText={errors.firstName}

//                             />
//                             <TextField
//                                 label="Last Name"
//                                 fullWidth
//                                 size="small"
//                                 sx={{
//                                     backgroundColor: `${theme.palette.background.default}`,
//                                     borderRadius: 1,
//                                     mb: 2

//                                 }}
//                                 value={formValues.lastName}
//                                 onChange={(e) => handleFieldChange("lastName", e.target.value)}
//                                 error={Boolean(errors.lastName)}
//                                 helperText={errors.lastName}

//                             />
//                             <TextField
//                                 label="Email"
//                                 fullWidth
//                                 size="small"
//                                 sx={{
//                                     backgroundColor: `${theme.palette.background.default}`,
//                                     borderRadius: 1,
//                                     mb: 2

//                                 }}
//                                 value={formValues.email}
//                                 onChange={(e) => handleFieldChange("email", e.target.value)}
//                                 error={Boolean(errors.email)}
//                                 helperText={errors.email}

//                             />
//                             <TextField
//                                 label="Password"
//                                 type={showSignupPassword ? "text" : "password"}
//                                 fullWidth
//                                 size="small"
//                                 sx={{
//                                     backgroundColor: `${theme.palette.background.default}`,
//                                     borderRadius: 1,
//                                     mb: 2

//                                 }}
//                                 value={formValues.password}
//                                 onChange={(e) => handleFieldChange("password", e.target.value)}
//                                 error={Boolean(errors.password)}
//                                 helperText={errors.password}
//                                 InputProps={{
//                                     endAdornment: (
//                                         <InputAdornment position="end">
//                                             <IconButton aria-label="toggle password visibility" onClick={handleClickShowSignupPassword} edge="end">
//                                                 {showSignupPassword ? <VisibilityOff /> : <Visibility />}
//                                             </IconButton>
//                                         </InputAdornment>
//                                     )
//                                 }}

//                             />

//                             <Box sx={{ mt: 2, mb: 2 }}>
//                                 <Typography variant="body2">
//                                     Profile Image
//                                 </Typography>
//                                 {imageFile ? (
//                                     <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2, mb: 2 }}>
//                                         <Typography variant="body2" color={theme.palette.text.primary}>
//                                             {imageFile.name} ({(imageFile.size / 1024).toFixed(2)} KB)
//                                         </Typography>
//                                         <IconButton
//                                             color="error"
//                                             onClick={handleRemoveImage}
//                                             size="small"
//                                         >
//                                             <Delete />
//                                         </IconButton>
//                                     </Box>
//                                 ) : (
//                                     <Box sx={{ display: "flex", alignItems: 'center', mt: 2, gap: 2 }}>
//                                         <Button
//                                             variant='outlined'
//                                             component="label"
//                                             color="primary"
//                                             startIcon={<PhotoCamera />}
//                                             sx={{ minWidth: 200 }}>
//                                             Choose Image
//                                             <input
//                                                 type="file"
//                                                 hidden
//                                                 accept="image/*"
//                                                 onChange={handleImageChange}
//                                             />
//                                         </Button>
//                                     </Box>
//                                 )}

//                                 {errors.image && (
//                                     <Typography variant="caption" color="error">
//                                         {errors.image}
//                                     </Typography>
//                                 )}
//                             </Box>
//                             <Button
//                                 variant="contained"
//                                 fullWidth
//                                 type="submit"
//                                 sx={{
//                                     mt: 2,
//                                     py: 1.2,
//                                     borderRadius: 2,
//                                     textTransform: "none",
//                                     fontWeight: 600,
//                                     boxShadow: "0px 4px 10px rgba(25, 118, 210, 0.3)",
//                                     "&:hover": {
//                                         boxShadow: "0px 6px 14px rgba(25, 118, 210, 0.4)",
//                                     },
//                                 }}
//                             >
//                                 Sign Up
//                             </Button>
//                         </form>

//                         <Typography variant="body2" mt={2} mb={5}>
//                             Already have an account?{" "}
//                             <Link href="/login" underline="hover">
//                                 Sign In
//                             </Link>
//                         </Typography>
//                     </Box>
//                 </Box>
//             </Paper>
//         </Container >
//     );
// }

// export default SignUp

"use client";

import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Link,
  Paper,
  Grid,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { Delete } from "@mui/icons-material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCompanyAuth } from "@/contexts/companyAuthContext";
import { companySignupSchema } from "@/lib/validation/companyAuthSchema";
import { safeParse } from "valibot";

const CompanySignUp = () => {
  const theme = useTheme();
  const router = useRouter();
  const { register } = useCompanyAuth();

  const [logo, setLogo] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [formValues, setFormValues] = useState({
    name: "",
    description: "",
    industry: "",
    website: "",
    email: "",
    phone: "",
    password: "",
    city: "",
    country: "",
  });

  const handleFieldChange = (field: keyof typeof formValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors({ logo: "Please select a valid image file" });
        return;
      }
      setLogo(file);
      setErrors((prev) => ({ ...prev, logo: "" }));
    }
  };

  const handleRemoveLogo = () => {
    setLogo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = safeParse(companySignupSchema,
      {
        name: formValues.name,
        description: formValues.description,
        website: formValues.website,
        industry: formValues.industry,
        city: formValues.city,
        country: formValues.country,
        email: formValues.email,
        phone: formValues.phone,
        password: formValues.password,
        logo: logo
      });
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
      if (!logo) {
        setErrors({ ...errors, image: "Profile image is required" });
        return;
      }
      const success = await register({
        name: formValues.name,
        description: formValues.description,
        industry: formValues.industry,
        website: formValues.website,
        password: formValues.password,
        contact: {
          email: formValues.email,
          phone: formValues.phone,
        },
        location: {
          city: formValues.city,
          country: formValues.country,
        },
        logo: logo || undefined,
      });

      if (success) {
        router.push("/company/dashboard");
      } else {
        setErrors({ general: "Company registration failed" });
      }
    }
    catch (err: unknown) {
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
        alignItems: "center",
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
          background: "rgba(0,0,0,0.4)",
          zIndex: 1,
        },
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: { xs: "90%", md: "80%" },
          maxWidth: 1000,
          borderRadius: 3,
          p: { xs: 3, md: 6 },
          zIndex: 2,
          backdropFilter: "blur(12px)",
          background: "rgba(255, 255, 255, 0.9)",
        }}
      >
        <Typography variant="h4" mb={3} textAlign="center" fontWeight={700}>
          Company Sign Up
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Left Column */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Company Name"
                fullWidth
                value={formValues.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                error={Boolean(errors.name)}
                helperText={errors.name}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Industry"
                fullWidth
                value={formValues.industry}
                onChange={(e) => handleFieldChange("industry", e.target.value)}
                error={Boolean(errors.industry)}
                helperText={errors.industry}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Website"
                fullWidth
                value={formValues.website}
                onChange={(e) => handleFieldChange("website", e.target.value)}
                error={Boolean(errors.website)}
                helperText={errors.website}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={4}
                value={formValues.description}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                error={Boolean(errors.description)}
                helperText={errors.description}
              />
            </Grid>

            {/* Right Column */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Email"
                fullWidth
                value={formValues.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                error={Boolean(errors.email)}
                helperText={errors.email}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Phone"
                fullWidth
                value={formValues.phone}
                onChange={(e) => handleFieldChange("phone", e.target.value)}
                error={Boolean(errors.phone)}
                helperText={errors.phone}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                value={formValues.password}
                onChange={(e) => handleFieldChange("password", e.target.value)}
                error={Boolean(errors.password)}
                helperText={errors.password}
                sx={{ mb: 2 }}
              />
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, md: 6 }}>
                  <TextField
                    label="City"
                    fullWidth
                    value={formValues.city}
                    onChange={(e) => handleFieldChange("city", e.target.value)}
                    error={Boolean(errors.city)}
                    helperText={errors.city}
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 6 }}>
                  <TextField
                    label="Country"
                    fullWidth
                    value={formValues.country}
                    onChange={(e) => handleFieldChange("country", e.target.value)}
                    error={Boolean(errors.country)}
                    helperText={errors.country}
                  />
                </Grid>
              </Grid>

              {/* Logo Upload */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" mb={1}>
                  Company Logo
                </Typography>
                {logo ? (
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="body2">{logo.name}</Typography>
                    <IconButton onClick={handleRemoveLogo} color="error">
                      <Delete />
                    </IconButton>
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<PhotoCamera />}
                    sx={{ mt: 1 }}
                  >
                    Upload Logo
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                  </Button>
                )}
                {errors.logo && (
                  <Typography variant="caption" color="error">
                    {errors.logo}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>

          {errors.general && (
            <Typography color="error" mt={2} textAlign="center">
              {errors.general}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0px 4px 10px rgba(25, 118, 210, 0.3)",
              "&:hover": {
                boxShadow: "0px 6px 14px rgba(25, 118, 210, 0.4)",
              },
            }}
          >
            Register Company
          </Button>

          <Typography textAlign="center" mt={2}>
            Already registered?{" "}
            <Link href="/company/login" underline="hover">
              Sign In
            </Link>
          </Typography>
        </form>
      </Paper>
    </Container>
  );
};

export default CompanySignUp;



