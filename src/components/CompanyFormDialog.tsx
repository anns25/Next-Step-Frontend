import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Tabs,
  Tab,
  Box,
  Stack,
  Chip,
  Alert,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { PhotoCamera, Delete } from "@mui/icons-material";
import { Company } from "@/types/Company";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: FormData) => Promise<void>;
  initialData?: Company | null;
};

const CompanyFormDialog: React.FC<Props> = ({ open, onClose, onSave, initialData }) => {
  const [tab, setTab] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    description: "",
    website: "",
    foundedYear: "",
    contact: {
      email: "",
      phone: "",
      linkedin: "",
      twitter: "",
    },
    location: {
      address: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
    },
    benefits: [] as string[],
    culture: [] as string[],
    status: "active",
    isRemoteFriendly: false,
    canPostJobs: true,
    maxJobs: 50,
  });

  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [newBenefit, setNewBenefit] = useState("");
  const [newCulture, setNewCulture] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const industries = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Manufacturing",
    "Retail",
    "Consulting",
    "Media",
    "Real Estate",
    "Other",
  ];

  const countries = [
    "United States",
    "Canada",
    "United Kingdom",
    "Germany",
    "France",
    "Australia",
    "Japan",
    "India",
    "Brazil",
    "Other",
  ];

  // preload data for editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        industry: initialData.industry || "",
        description: initialData.description || "",
        website: initialData.website || "",
        foundedYear: initialData.foundedYear?.toString() || "",
        contact: {
          email: initialData.contact?.email || "",
          phone: initialData.contact?.phone || "",
          linkedin: initialData.contact?.linkedin || "",
          twitter: initialData.contact?.twitter || "",
        },
        location: {
          address: initialData.location?.address || "",
          city: initialData.location?.city || "",
          state: initialData.location?.state || "",
          country: initialData.location?.country || "",
          zipCode: initialData.location?.zipCode || "",
        },
        benefits: initialData.benefits || [],
        culture: initialData.culture || [],
        status: initialData.status || "active",
        isRemoteFriendly: initialData.isRemoteFriendly || false,
        canPostJobs: initialData.canPostJobs !== undefined ? initialData.canPostJobs : true,
        maxJobs: initialData.maxJobs || 50,
      });
      if (initialData.logo) {
        setLogoPreview(`${process.env.NEXT_PUBLIC_API_URL}/uploads/${initialData.logo}`);
      }
    } else {
      resetForm();
    }
  }, [initialData]);

  const resetForm = () => {
    setFormData({
      name: "",
      industry: "",
      description: "",
      website: "",
      foundedYear: "",
      contact: { email: "", phone: "", linkedin: "", twitter: "" },
      location: { address: "", city: "", state: "", country: "", zipCode: "" },
      benefits: [],
      culture: [],
      status: "active",
      isRemoteFriendly: false,
      canPostJobs: true,
      maxJobs: 50,
    });
    setLogo(null);
    setLogoPreview(null);
    setErrors({});
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleInputChange = (
    field: string,
    value: string | boolean | number,
    nested?: "contact" | "location"
  ) => {
    if (nested) {
      setFormData((prev) => ({
        ...prev,
        [nested]: { ...prev[nested], [field]: value },
      }));
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[`${nested}.${field}`];
        return updated;
      });
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleAddChip = (field: "benefits" | "culture", value: string) => {
    if (!value.trim()) return;
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], value],
    }));
    if (field === "benefits") setNewBenefit("");
    if (field === "culture") setNewCulture("");
  };

  const handleDeleteChip = (field: "benefits" | "culture", chip: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((c) => c !== chip),
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveLogo = () => {
    setLogo(null);
    setLogoPreview(null);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    if (!formData.name) newErrors.name = "Company name is required";
    if (!formData.description) newErrors.description = "Company description is required";
    if (!formData.industry) newErrors.industry = "Industry is required";
    if (!formData.contact.email) newErrors["contact.email"] = "Email is required";
    if (!formData.location.city) newErrors["location.city"] = "City is required";
    if (!formData.location.country) newErrors["location.country"] = "Country is required";
    
    // Validation rules
    if (formData.name && formData.name.length > 100) {
      newErrors.name = "Company name cannot exceed 100 characters";
    }
    if (formData.description && formData.description.length > 2000) {
      newErrors.description = "Description cannot exceed 2000 characters";
    }
    if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      newErrors.website = "Please enter a valid website URL";
    }
    if (formData.contact.email && !formData.contact.email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
      newErrors["contact.email"] = "Please enter a valid email";
    }
    if (formData.foundedYear && (isNaN(Number(formData.foundedYear)) || Number(formData.foundedYear) < 1800 || Number(formData.foundedYear) > new Date().getFullYear())) {
      newErrors.foundedYear = "Please enter a valid founded year";
    }
    if (formData.maxJobs && (isNaN(Number(formData.maxJobs)) || Number(formData.maxJobs) < 1)) {
      newErrors.maxJobs = "Max jobs must be a positive number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setErrorMessage("Please fix the highlighted errors.");
      return;
    }

    const data = new FormData();
    
    // Basic information
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("industry", formData.industry);
    data.append("website", formData.website);
    if (formData.foundedYear) data.append("foundedYear", formData.foundedYear);
    
    // Contact information
    data.append("contact[email]", formData.contact.email);
    if (formData.contact.phone) data.append("contact[phone]", formData.contact.phone);
    if (formData.contact.linkedin) data.append("contact[linkedin]", formData.contact.linkedin);
    if (formData.contact.twitter) data.append("contact[twitter]", formData.contact.twitter);
    
    // Location information
    if (formData.location.address) data.append("location[address]", formData.location.address);
    data.append("location[city]", formData.location.city);
    if (formData.location.state) data.append("location[state]", formData.location.state);
    data.append("location[country]", formData.location.country);
    if (formData.location.zipCode) data.append("location[zipCode]", formData.location.zipCode);
    
    // Arrays
    formData.benefits.forEach((b, i) => data.append(`benefits[${i}]`, b));
    formData.culture.forEach((c, i) => data.append(`culture[${i}]`, c));
    
    // Settings
    data.append("status", formData.status);
    data.append("isRemoteFriendly", formData.isRemoteFriendly.toString());
    data.append("canPostJobs", formData.canPostJobs.toString());
    data.append("maxJobs", formData.maxJobs.toString());
    
    // Logo
    if (logo) data.append("logo", logo);

    try {
      await onSave(data);
      setSuccessMessage("Company saved successfully!");
      setErrorMessage("");
      resetForm();
      onClose();
    } catch (err) {
      setErrorMessage("Failed to save company. Please try again.");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {initialData ? "Edit Company" : "Add New Company"}
      </DialogTitle>
      <DialogContent dividers>
        {successMessage && <Alert severity="success">{successMessage}</Alert>}
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Basic Info" />
          <Tab label="Contact" />
          <Tab label="Location" />
          <Tab label="Culture & Benefits" />
          <Tab label="Settings" />
        </Tabs>

        {tab === 0 && (
          <Stack spacing={2}>
            <TextField
              label="Company Name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
              required
            />
            <FormControl fullWidth required error={!!errors.industry}>
              <InputLabel>Industry</InputLabel>
              <Select
                value={formData.industry}
                onChange={(e) => handleInputChange("industry", e.target.value)}
                label="Industry"
              >
                {industries.map((industry) => (
                  <MenuItem key={industry} value={industry}>
                    {industry}
                  </MenuItem>
                ))}
              </Select>
              {errors.industry && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                  {errors.industry}
                </Typography>
              )}
            </FormControl>
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              error={!!errors.description}
              helperText={errors.description}
              multiline
              rows={3}
              fullWidth
              required
            />
            <TextField
              label="Website"
              value={formData.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              error={!!errors.website}
              helperText={errors.website || "e.g., https://example.com"}
              fullWidth
              placeholder="https://example.com"
            />
            <TextField
              label="Founded Year"
              value={formData.foundedYear}
              onChange={(e) => handleInputChange("foundedYear", e.target.value)}
              error={!!errors.foundedYear}
              helperText={errors.foundedYear}
              fullWidth
              type="number"
              inputProps={{ min: 1800, max: new Date().getFullYear() }}
            />

            <Box>
              <Typography variant="subtitle1">Company Logo</Typography>
              {logoPreview ? (
                <Box display="flex" alignItems="center" gap={2}>
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }}
                  />
                  <IconButton color="error" onClick={handleRemoveLogo}>
                    <Delete />
                  </IconButton>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCamera />}
                >
                  Upload Logo
                  <input type="file" hidden accept="image/*" onChange={handleLogoChange} />
                </Button>
              )}
            </Box>
          </Stack>
        )}

        {tab === 1 && (
          <Stack spacing={2}>
            <TextField
              label="Email"
              value={formData.contact.email}
              onChange={(e) => handleInputChange("email", e.target.value, "contact")}
              error={!!errors["contact.email"]}
              helperText={errors["contact.email"]}
              fullWidth
              required
              type="email"
            />
            <TextField
              label="Phone"
              value={formData.contact.phone}
              onChange={(e) => handleInputChange("phone", e.target.value, "contact")}
              fullWidth
            />
            <TextField
              label="LinkedIn"
              value={formData.contact.linkedin}
              onChange={(e) => handleInputChange("linkedin", e.target.value, "contact")}
              fullWidth
              placeholder="https://linkedin.com/company/example"
            />
            <TextField
              label="Twitter"
              value={formData.contact.twitter}
              onChange={(e) => handleInputChange("twitter", e.target.value, "contact")}
              fullWidth
              placeholder="https://twitter.com/example"
            />
          </Stack>
        )}

        {tab === 2 && (
          <Stack spacing={2}>
            <TextField
              label="Address"
              value={formData.location.address}
              onChange={(e) => handleInputChange("address", e.target.value, "location")}
              fullWidth
            />
            <TextField
              label="City"
              value={formData.location.city}
              onChange={(e) => handleInputChange("city", e.target.value, "location")}
              error={!!errors["location.city"]}
              helperText={errors["location.city"]}
              fullWidth
              required
            />
            <TextField
              label="State/Province"
              value={formData.location.state}
              onChange={(e) => handleInputChange("state", e.target.value, "location")}
              fullWidth
            />
            <FormControl fullWidth required error={!!errors["location.country"]}>
              <InputLabel>Country</InputLabel>
              <Select
                value={formData.location.country}
                onChange={(e) => handleInputChange("country", e.target.value, "location")}
                label="Country"
              >
                {countries.map((country) => (
                  <MenuItem key={country} value={country}>
                    {country}
                  </MenuItem>
                ))}
              </Select>
              {errors["location.country"] && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                  {errors["location.country"]}
                </Typography>
              )}
            </FormControl>
            <TextField
              label="ZIP/Postal Code"
              value={formData.location.zipCode}
              onChange={(e) => handleInputChange("zipCode", e.target.value, "location")}
              fullWidth
            />
          </Stack>
        )}

        {tab === 3 && (
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle1">Benefits</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                {formData.benefits.map((b) => (
                  <Chip key={b} label={b} onDelete={() => handleDeleteChip("benefits", b)} />
                ))}
              </Stack>
              <Stack direction="row" spacing={1}>
                <TextField
                  label="Add Benefit"
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddChip("benefits", newBenefit);
                    }
                  }}
                />
                <Button onClick={() => handleAddChip("benefits", newBenefit)}>Add</Button>
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle1">Company Culture</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                {formData.culture.map((c) => (
                  <Chip key={c} label={c} onDelete={() => handleDeleteChip("culture", c)} />
                ))}
              </Stack>
              <Stack direction="row" spacing={1}>
                <TextField
                  label="Add Culture"
                  value={newCulture}
                  onChange={(e) => setNewCulture(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddChip("culture", newCulture);
                    }
                  }}
                />
                <Button onClick={() => handleAddChip("culture", newCulture)}>Add</Button>
              </Stack>
            </Box>
          </Stack>
        )}

        {tab === 4 && (
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isRemoteFriendly}
                  onChange={(e) => handleInputChange("isRemoteFriendly", e.target.checked)}
                />
              }
              label="Remote Friendly"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.canPostJobs}
                  onChange={(e) => handleInputChange("canPostJobs", e.target.checked)}
                />
              }
              label="Can Post Jobs"
            />
            
            <TextField
              label="Max Jobs Allowed"
              value={formData.maxJobs}
              onChange={(e) => handleInputChange("maxJobs", e.target.value)}
              error={!!errors.maxJobs}
              helperText={errors.maxJobs}
              fullWidth
              type="number"
              inputProps={{ min: 1 }}
            />
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CompanyFormDialog;

