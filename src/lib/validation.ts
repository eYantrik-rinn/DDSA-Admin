import { z } from 'zod';

// Common validation patterns
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const usernameRegex = /^[a-zA-Z0-9_]+$/;
const nameRegex = /^[a-zA-Z\s'-]+$/;
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;

// Common error messages
const errorMessages = {
  email: {
    required: 'Email is required',
    invalid: 'Please enter a valid email address',
    format: 'Email format is invalid',
  },
  password: {
    required: 'Password is required',
    min: 'Password must be at least 8 characters',
    max: 'Password cannot exceed 100 characters',
    strong: 'Password must include uppercase, lowercase, number, and special character',
    match: "Passwords don't match",
  },
  username: {
    required: 'Username is required',
    min: 'Username must be at least 3 characters',
    max: 'Username cannot exceed 20 characters',
    format: 'Username can only contain letters, numbers, and underscores',
  },
  name: {
    required: 'Name is required',
    format: 'Name can only contain letters, spaces, hyphens, and apostrophes',
    min: 'Name must be at least 2 characters',
    max: 'Name cannot exceed 50 characters',
  }
};

// Sanitize input string (trim and normalize)
const sanitizeString = (value: string) => value.trim().normalize();

// Email validation with sanitization
const emailValidation = z
  .string({ required_error: errorMessages.email.required })
  .trim()
  .toLowerCase()
  .min(1, errorMessages.email.required)
  .max(255, 'Email is too long')
  .regex(emailRegex, errorMessages.email.format)
  .email(errorMessages.email.invalid)
  .transform(sanitizeString);

// Strong password validation
const passwordValidation = z
  .string({ required_error: errorMessages.password.required })
  .min(8, errorMessages.password.min)
  .max(100, errorMessages.password.max)
  .regex(strongPasswordRegex, errorMessages.password.strong);

// Username validation
const usernameValidation = z
  .string({ required_error: errorMessages.username.required })
  .trim()
  .min(3, errorMessages.username.min)
  .max(20, errorMessages.username.max)
  .regex(usernameRegex, errorMessages.username.format)
  .transform(sanitizeString);

// Name validation
const nameValidation = z
  .string()
  .trim()
  .min(2, errorMessages.name.min)
  .max(50, errorMessages.name.max)
  .regex(nameRegex, errorMessages.name.format)
  .transform(sanitizeString)
  .optional()
  .nullable();

// Login schema with enhanced validation and normalization
export const loginSchema = z.object({
  email: emailValidation,
  password: z
    .string({ required_error: errorMessages.password.required })
    .min(1, errorMessages.password.required),
  fingerprint: z.string().optional(),
  returnUrl: z.string().optional(),
});

// Registration schema with enhanced validation
export const registerSchema = z
  .object({
    username: usernameValidation,
    email: emailValidation,
    password: passwordValidation,
    confirmPassword: z.string({ required_error: 'Please confirm your password' }),
    firstName: nameValidation,
    lastName: nameValidation,
    terms: z
      .boolean()
      .refine((val) => val === true, 'You must accept the terms and conditions'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: errorMessages.password.match,
    path: ['confirmPassword'],
  });

// Password reset request schema
export const forgotPasswordSchema = z.object({
  email: emailValidation,
});

// Password reset schema with enhanced validation
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordValidation,
    confirmPassword: z.string({ required_error: 'Please confirm your password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: errorMessages.password.match,
    path: ['confirmPassword'],
  });

// Profile update schema
export const profileUpdateSchema = z.object({
  firstName: nameValidation,
  lastName: nameValidation,
  username: usernameValidation.optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmNewPassword: z.string().optional(),
}).refine(
  (data) => {
    // If any password field is filled, all must be filled
    const passwordFields = [data.currentPassword, data.newPassword, data.confirmNewPassword];
    const hasPasswordChange = passwordFields.some(Boolean);
    return hasPasswordChange ? passwordFields.every(Boolean) : true;
  }, 
  {
    message: 'All password fields must be filled to change password',
    path: ['currentPassword'], 
  }
).refine(
  (data) => {
    // If changing password, new and confirm must match
    if (!data.newPassword) return true;
    return data.newPassword === data.confirmNewPassword;
  },
  {
    message: "New passwords don't match",
    path: ['confirmNewPassword'],
  }
).refine(
  (data) => {
    // If changing password, new must be strong
    if (!data.newPassword) return true;
    return strongPasswordRegex.test(data.newPassword);
  },
  {
    message: errorMessages.password.strong,
    path: ['newPassword'],
  }
);

// Inferred Types
export type RegisterData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;