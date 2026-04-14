import React from 'react';
import { TextField, type TextFieldProps, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#fff',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    '& fieldset': {
      borderColor: alpha('#000', 0.1),
    },
    '&:hover fieldset': {
      borderColor: theme.palette.secondary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.secondary.main,
      borderWidth: '2px',
    },
  },
  '& .MuiInputBase-input': {
    fontWeight: 700,
    fontSize: '1rem',
    /* Hide spin buttons Chrome, Safari, Edge, Opera */
    '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
      '-webkit-appearance': 'none',
      margin: 0,
    },
    /* Hide spin buttons Firefox */
    '&[type=number]': {
      '-moz-appearance': 'textfield',
    },
  },
}));

interface NumberFieldProps extends Omit<TextFieldProps, 'onChange'> {
  onChange?: (value: number | "") => void;
  onEnter?: () => void;
  max?: number;
  min?: number;
}

export const NumberField = React.forwardRef<HTMLDivElement, NumberFieldProps>((props, ref) => {
  const { onChange, onEnter, value, ...rest } = props;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && onEnter) {
      onEnter();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow empty string for clearing input
    if (val === "") {
        onChange?.("");
        return;
    }

    // RegEx to allow only numbers and a single decimal point
    const match = val.match(/^[0-9]*\.?[0-9]*$/);
    if (match) {
        onChange?.(parseFloat(val));
    }
  };

  return (
    <StyledTextField
      {...rest}
      ref={ref}
      value={value === 0 ? "" : value} // Show empty string instead of 0 for initialization
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      autoComplete="off"
      type="text" // Using text with regex to completely control the numeric input and avoid browser numeric behaviors
      inputProps={{
        inputMode: 'decimal',
        onWheel: (e: any) => e.target.blur(), // Prevent accidental scroll changes
        ...rest.inputProps,
      }}
    />
  );
});

NumberField.displayName = 'NumberField';
