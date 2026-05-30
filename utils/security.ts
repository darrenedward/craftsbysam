/**
 * Security utilities for CSRF protection, secure random generation, etc.
 */

/**
 * Generate a cryptographically secure random token
 */
export const generateSecureToken = (): string => {
  const array = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback for older browsers
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }

  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * CSRF Token management
 */
const CSRF_TOKEN_KEY = 'csrf_token';
const CSRF_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get or create CSRF token
 */
export const getCsrfToken = (): string => {
  let token = localStorage.getItem(CSRF_TOKEN_KEY);

  // Check if token exists and is not expired
  if (token) {
    try {
      const data = JSON.parse(token);
      if (Date.now() < data.expiry) {
        return data.token;
      }
    } catch {
      // Invalid token, create new one
    }
  }

  // Generate new token
  const newToken = generateSecureToken();
  const expiry = Date.now() + CSRF_TOKEN_EXPIRY;

  localStorage.setItem(CSRF_TOKEN_KEY, JSON.stringify({
    token: newToken,
    expiry
  }));

  return newToken;
};

/**
 * Validate CSRF token
 */
export const validateCsrfToken = (token: string): boolean => {
  const stored = localStorage.getItem(CSRF_TOKEN_KEY);

  if (!stored) return false;

  try {
    const data = JSON.parse(stored);
    return data.token === token && Date.now() < data.expiry;
  } catch {
    return false;
  }
};

/**
 * Clear CSRF token (call on logout)
 */
export const clearCsrfToken = (): void => {
  localStorage.removeItem(CSRF_TOKEN_KEY);
};

/**
 * Generate idempotency key for payment operations
 */
export const generateIdempotencyKey = (): string => {
  return `${Date.now()}-${generateSecureToken().substring(0, 16)}`;
};

/**
 * Store idempotency key to prevent duplicate payment processing
 */
const IDEMPOTENCY_STORE = new Map<string, { timestamp: number; used: boolean }>();

export const checkIdempotency = (key: string): boolean => {
  const entry = IDEMPOTENCY_STORE.get(key);
  const now = Date.now();

  // Entries expire after 1 hour
  if (entry && now - entry.timestamp > 3600000) {
    IDEMPOTENCY_STORE.delete(key);
    return false;
  }

  return entry ? entry.used : false;
};

export const markIdempotencyUsed = (key: string): void => {
  IDEMPOTENCY_STORE.set(key, {
    timestamp: Date.now(),
    used: true
  });
};

/**
 * Clear old idempotency entries (prevent memory leaks)
 */
export const clearExpiredIdempotency = (): void => {
  const now = Date.now();
  for (const [key, value] of IDEMPOTENCY_STORE.entries()) {
    if (now - value.timestamp > 3600000) {
      IDEMPOTENCY_STORE.delete(key);
    }
  }
};

// Clear expired entries every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(clearExpiredIdempotency, 600000);
}

/**
 * Check if the connection is secure (HTTPS)
 */
export const isSecureConnection = (): boolean => {
  if (typeof window === 'undefined') return false;

  return (
    window.location.protocol === 'https:' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
};

/**
 * Enforce HTTPS redirect (in production)
 */
export const enforceHttps = (): void => {
  if (typeof window === 'undefined') return;

  if (!isSecureConnection() && !window.location.hostname.includes('localhost')) {
    window.location.href = `https:${window.location.href.substring(window.location.protocol.length)}`;
  }
};

/**
 * Secure localStorage wrapper that doesn't expose sensitive data
 */
export const secureStorage = {
  setItem: (key: string, value: string, isSensitive: boolean = false): void => {
    if (isSensitive) {
      // In production, sensitive data should be encrypted
      // For now, we'll skip storing sensitive data in localStorage
      console.warn('Attempted to store sensitive data in localStorage');
      return;
    }
    localStorage.setItem(key, value);
  },

  getItem: (key: string): string | null => {
    return localStorage.getItem(key);
  },

  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  }
};

/**
 * Content Security Policy nonce generator
 */
export const generateCspNonce = (): string => {
  return generateSecureToken().substring(0, 16);
};

/**
 * Validate that a request comes from the same origin
 */
export const validateSameOrigin = (url: string): boolean => {
  try {
    const target = new URL(url);
    const current = typeof window !== 'undefined' ? window.location : { origin: 'http://localhost' };

    return target.origin === current.origin;
  } catch {
    return false;
  }
};

/**
 * Sanitize error messages to prevent information leakage
 */
export const sanitizeErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    // Remove potentially sensitive information
    return error
      .replace(/password/i, '***')
      .replace(/secret/i, '***')
      .replace(/token/i, '***')
      .replace(/api[_-]?key/i, '***')
      .substring(0, 200);
  }

  if (error?.message) {
    return sanitizeErrorMessage(error.message);
  }

  return 'An error occurred. Please try again.';
};

/**
 * Check if user agent is a bot (basic detection)
 */
export const isLikelyBot = (): boolean => {
  if (typeof navigator === 'undefined') return false;

  const botPatterns = [
    /bot/i,
    /spider/i,
    /crawl/i,
    /headless/i,
    /phantom/i,
    /selenium/i,
    /puppeteer/i
  ];

  return botPatterns.some(pattern => pattern.test(navigator.userAgent));
};

/**
 * Rate limiting by IP (client-side approximation)
 */
export const getClientFingerprint = (): string => {
  // Simple fingerprint based on available browser features
  const features = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset()
  ];

  // Simple hash (not cryptographically secure, but sufficient for rate limiting)
  return features.join('|').split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0).toString(36);
};
