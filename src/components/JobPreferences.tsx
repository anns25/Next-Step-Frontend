import React from 'react';
import { Box, FormControl, FormLabel, FormGroup, FormControlLabel, Checkbox, Typography } from '@mui/material';

interface JobPreferencesProps {
  preferences: string[];
  onChange: (preferences: string[]) => void;
  disabled?: boolean; // Made this optional with ? 
}

const JOB_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'remote', label: 'Remote' }
];

export const JobPreferences: React.FC<JobPreferencesProps> = ({ 
  preferences, 
  onChange, 
  disabled = false // Default value
}) => {
  const handleCheckboxChange = (jobType: string, checked: boolean) => {
    if (checked) {
      onChange([...preferences, jobType]);
    } else {
      onChange(preferences.filter(type => type !== jobType));
    }
  };

  return (
    <FormControl component="fieldset" disabled={disabled}>
      <FormLabel component="legend">
        <Typography variant="h6" gutterBottom>
          Job Preferences
        </Typography>
      </FormLabel>
      <FormGroup>
        {JOB_TYPES.map((jobType) => (
          <FormControlLabel
            key={jobType.value}
            control={
              <Checkbox
                checked={preferences.includes(jobType.value)}
                onChange={(e) => handleCheckboxChange(jobType.value, e.target.checked)}
                name={jobType.value}
              />
            }
            label={jobType.label}
          />
        ))}
      </FormGroup>
    </FormControl>
  );
};