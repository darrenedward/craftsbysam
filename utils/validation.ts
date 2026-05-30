/**
 * Input validation and sanitization utilities
 * Prevents injection attacks and ensures data integrity
 */

/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return '';

  // Remove potentially dangerous characters and patterns
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
    .trim()
    .substring(0, 1000); // Limit length
};

/**
 * Validate and sanitize email addresses
 */
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;

  // RFC 5322 compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Validate and sanitize phone numbers
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;

  // Allow international formats with +, digits, spaces, dashes, parentheses
  const phoneRegex = /^\+?[\d\s\-()]+$/;

  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  return phoneRegex.test(phone) && cleanPhone.length >= 7 && cleanPhone.length <= 15;
};

/**
 * Validate postal codes
 */
export const validatePostalCode = (postalCode: string): boolean => {
  if (!postalCode || typeof postalCode !== 'string') return false;

  // Allow alphanumeric postal codes (US: 12345, UK: SW1A 1AA, etc.)
  const postalRegex = /^[a-zA-Z0-9\s\-]{3,10}$/;
  return postalRegex.test(postalCode);
};

/**
 * Sanitize address fields
 */
export const sanitizeAddress = (address: string): string => {
  if (!address || typeof address !== 'string') return '';

  return sanitizeString(address).substring(0, 200);
};

/**
 * Validate currency amount (positive number with max 2 decimal places)
 */
export const validateAmount = (amount: number): boolean => {
  return typeof amount === 'number' &&
         !isNaN(amount) &&
         isFinite(amount) &&
         amount >= 0 &&
         amount <= 1000000 &&
         /^\d+(\.\d{1,2})?$/.test(amount.toString());
};

/**
 * Validate product price
 */
export const validatePrice = (price: number): boolean => {
  return validateAmount(price) && price >= 0 && price <= 10000;
};

/**
 * Validate URL to prevent open redirects
 */
export const validateUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;

  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;

    // Prevent javascript: and data: URLs
    if (url.toLowerCase().startsWith('javascript:') || url.toLowerCase().startsWith('data:')) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

/**
 * Validate product name
 */
export const validateProductName = (name: string): boolean => {
  return typeof name === 'string' &&
         name.length >= 1 &&
         name.length <= 200 &&
         !/[<>]/.test(name);
};

/**
 * Validate quantity (positive integer)
 */
export const validateQuantity = (quantity: number): boolean => {
  return Number.isInteger(quantity) && quantity >= 0 && quantity <= 10000;
};

/**
 * Sanitize user-provided names
 */
export const validateName = (name: string): boolean => {
  if (!name || typeof name !== 'string') return false;

  // Allow letters, spaces, hyphens, apostrophes, and common diacritics
  const nameRegex = /^[a-zA-ZÀ-ÿ\s\-'\.]{1,100}$/;
  return nameRegex.test(name);
};

/**
 * Validate text input (general purpose)
 */
export const validateText = (text: string, maxLength: number = 1000): boolean => {
  return typeof text === 'string' &&
         text.length >= 0 &&
         text.length <= maxLength &&
         !/<script/i.test(text);
};

/**
 * Validate password strength
 * Requirements: 12+ chars, uppercase, lowercase, number, special char
 */
export const validatePassword = (password: string): { valid: boolean; score: number; feedback: string[] } => {
  const feedback = [];
  let score = 0;

  if (password.length >= 12) score += 1;
  else feedback.push("At least 12 characters");

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push("Uppercase letter");

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push("Lowercase letter");

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push("Number");

  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else feedback.push("Special character (!@#$%)");

  return {
    valid: score >= 4 && password.length >= 12,
    score: Math.min(5, score),
    feedback
  };
};

/**
 * Validate MFA code (6 digits)
 */
export const validateMfaCode = (code: string): boolean => {
  return /^\d{6}$/.test(code);
};

/**
 * Deep sanitize an object recursively
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const sanitized: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'string' ? sanitizeString(item) :
        typeof item === 'object' && item !== null ? sanitizeObject(item) :
        item
      );
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Rate limiting tracker (in-memory, for development)
 * In production, use Redis or similar
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export const checkRateLimit = (
  identifier: string,
  maxRequests: number = 5,
  windowMs: number = 60000
): { allowed: boolean; remaining: number } => {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count };
};

/**
 * Clear rate limit entries (call periodically to prevent memory leaks)
 */
export const clearExpiredRateLimits = (): void => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
};

// Clear expired rate limits every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(clearExpiredRateLimits, 300000);
}
