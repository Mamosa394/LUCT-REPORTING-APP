//validators
import { z } from 'zod';

// Login Schema
export const loginSchema = z.object({
  email: z.string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

// Register Schema with all 5 roles 
export const registerSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  
  email: z.string()
    .trim()
    .toLowerCase() // Normalize email to lowercase
    .min(1, 'Email is required')
  
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Please enter a valid email address (e.g., name@domain.com)'
    )
    .refine((email) => {
      // Additional validation rules:
      // 1. No spaces
      if (email.includes(' ')) return false;
      
      // 2. Only one @ symbol
      const atCount = (email.match(/@/g) || []).length;
      if (atCount !== 1) return false;
      
      // 3. Local part (before @) validation
      const [localPart, domain] = email.split('@');
      
      // Local part cannot start or end with dot
      if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
      
      // Local part cannot have consecutive dots
      if (localPart.includes('..')) return false;
      
      // Local part max 64 characters
      if (localPart.length > 64) return false;
      
      // Domain part validation
      if (!domain || domain.length < 3) return false;
      
      // Domain cannot start or end with hyphen
      if (domain.startsWith('-') || domain.endsWith('-')) return false;
      
      // Domain must have at least one dot and TLD at least 2 chars
      const domainParts = domain.split('.');
      if (domainParts.length < 2) return false;
      
      const tld = domainParts[domainParts.length - 1];
      if (tld.length < 2) return false;
      
      // Domain cannot have consecutive dots
      if (domain.includes('..')) return false;
      
      // Full email max 254 characters
      if (email.length > 254) return false;
      
      return true;
    }, { message: 'Invalid email format. Example: username@domain.com' }),
  
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  
  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
  
  role: z.enum(['student', 'lecturer', 'prl', 'pl'], {
    required_error: "Please select a role",
    invalid_type_error: "Invalid role selected",
  }),
  
  department: z.string()
    .trim()
    .min(1, 'Department is required')
    .min(2, 'Department name must be at least 2 characters')
    .max(100, 'Department name is too long'),
  
  // ADDED: Phone number field with validation
  phone: z.string()
    .optional()
    .refine((phone) => {
      if (!phone || phone.trim() === '') return true; // Optional field
      // Remove any spaces, dashes, or parentheses for validation
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
      // Check if it's a valid phone number format
      // International format: +26612345678 or local: 12345678
      const phoneRegex = /^(\+?[0-9]{1,4})?[0-9]{7,15}$/;
      return phoneRegex.test(cleanPhone);
    }, { message: 'Please enter a valid phone number (e.g., +26612345678 or 12345678)' }),
  
  studentId: z.string().optional(),
  employeeId: z.string().optional(),
  stream: z.string().optional(),
  
  // For logging purposes
  registrationLog: z.object({
    timestamp: z.any().optional(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
  }).optional(),
  
}).superRefine((data, ctx) => {
  // Password confirmation check
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });
  }
  
  // Role-specific validations
  switch (data.role) {
    case 'student':
      if (!data.studentId || data.studentId.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Student ID is required for student accounts",
          path: ["studentId"],
        });
      } else if (data.studentId.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Student ID must be at least 3 characters",
          path: ["studentId"],
        });
      } else if (data.studentId.trim().length > 20) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Student ID is too long (max 20 characters)",
          path: ["studentId"],
        });
      }
      break;
      
    case 'lecturer':
    case 'pl':
      if (!data.employeeId || data.employeeId.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Employee ID is required for ${data.role === 'lecturer' ? 'Lecturer' : 'Program Leader'} accounts`,
          path: ["employeeId"],
        });
      } else if (data.employeeId.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Employee ID must be at least 3 characters",
          path: ["employeeId"],
        });
      } else if (data.employeeId.trim().length > 20) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Employee ID is too long (max 20 characters)",
          path: ["employeeId"],
        });
      }
      break;
      
    case 'prl':
      if (!data.employeeId || data.employeeId.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Employee ID is required for Principal Lecturer accounts",
          path: ["employeeId"],
        });
      } else if (data.employeeId.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Employee ID must be at least 3 characters",
          path: ["employeeId"],
        });
      } else if (data.employeeId.trim().length > 20) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Employee ID is too long (max 20 characters)",
          path: ["employeeId"],
        });
      }
      
      if (!data.stream || data.stream.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Stream/Department managed is required for Principal Lecturer",
          path: ["stream"],
        });
      } else if (data.stream.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Stream/Department must be at least 2 characters",
          path: ["stream"],
        });
      } else if (data.stream.trim().length > 50) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Stream/Department is too long (max 50 characters)",
          path: ["stream"],
        });
      }
      break;
      
    case 'admin':
      // Admin accounts don't require studentId or employeeId
      // But we can add admin-specific validation if needed
      if (data.email && !data.email.includes('admin')) {
        // Optional: Add warning but don't block registration
        console.warn('Admin account created with non-admin email');
      }
      break;
      
    default:
      break;
  }
});

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: z.string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

// Helper function to get validation errors in a readable format
export const getValidationErrors = (error) => {
  if (error.errors) {
    return error.errors.reduce((acc, curr) => {
      acc[curr.path[0]] = curr.message;
      return acc;
    }, {});
  }
  return {};
};

// Helper function to validate role-specific fields before submission
export const validateRoleFields = (data) => {
  const errors = {};
  
  if (!data.department || data.department.trim() === '') {
    errors.department = 'Department is required';
  }
  
  switch (data.role) {
    case 'student':
      if (!data.studentId || data.studentId.trim() === '') {
        errors.studentId = 'Student ID is required for student accounts';
      }
      break;
      
    case 'lecturer':
    case 'prl':
    case 'pl':
      if (!data.employeeId || data.employeeId.trim() === '') {
        errors.employeeId = 'Employee ID is required for staff accounts';
      }
      break;
  }
  
  if (data.role === 'prl' && (!data.stream || data.stream.trim() === '')) {
    errors.stream = 'Stream/Department managed is required for Principal Lecturer';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Export all schemas and helpers
const validators = {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  getValidationErrors,
  validateRoleFields,
};

export default validators;