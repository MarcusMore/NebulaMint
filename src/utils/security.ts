/**
 * Security Utilities
 * Provides input validation, sanitization, and security checks
 */

/**
 * Sanitize string input to prevent XSS attacks
 * Removes potentially dangerous characters and HTML tags
 */
export const sanitizeString = (input: string, maxLength: number = 1000): string => {
  if (typeof input !== 'string') {
    return '';
  }

  // Trim and limit length
  let sanitized = input.trim().slice(0, maxLength);

  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Remove script tags and event handlers
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');

  // Remove null bytes and control characters (except newlines and tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return sanitized;
};

/**
 * Validate NFT name
 */
export const validateNFTName = (name: string): { valid: boolean; error?: string } => {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' };
  }

  const trimmed = name.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Name cannot be empty' };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Name must be 100 characters or less' };
  }

  // Check for potentially dangerous patterns
  if (/<script|javascript:|on\w+\s*=/i.test(trimmed)) {
    return { valid: false, error: 'Name contains invalid characters' };
  }

  return { valid: true };
};

/**
 * Validate NFT description
 */
export const validateNFTDescription = (description: string): { valid: boolean; error?: string } => {
  if (!description || typeof description !== 'string') {
    return { valid: true }; // Description is optional
  }

  if (description.length > 2000) {
    return { valid: false, error: 'Description must be 2000 characters or less' };
  }

  // Check for potentially dangerous patterns
  if (/<script|javascript:|on\w+\s*=/i.test(description)) {
    return { valid: false, error: 'Description contains invalid characters' };
  }

  return { valid: true };
};

/**
 * Validate Ethereum address format
 */
export const validateAddress = (address: string): { valid: boolean; error?: string } => {
  if (!address || typeof address !== 'string') {
    return { valid: false, error: 'Address is required' };
  }

  const trimmed = address.trim();

  // Check if it's a valid Ethereum address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
    return { valid: false, error: 'Invalid address format' };
  }

  return { valid: true };
};

/**
 * Validate contract address
 */
export const validateContractAddress = (address: string): { valid: boolean; error?: string } => {
  const addressValidation = validateAddress(address);
  if (!addressValidation.valid) {
    return addressValidation;
  }

  // Additional checks for contract addresses
  const trimmed = address.trim().toLowerCase();
  
  // Check for zero address
  if (trimmed === '0x0000000000000000000000000000000000000000') {
    return { valid: false, error: 'Contract address cannot be zero address' };
  }

  return { valid: true };
};

/**
 * Validate file type and size
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  if (!file || !(file instanceof File)) {
    return { valid: false, error: 'Invalid file' };
  }

  // Check file size (max 10MB for client-side, 100MB for IPFS)
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }

  // Validate MIME type - only allow image types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ];

  if (!file.type || !allowedMimeTypes.includes(file.type.toLowerCase())) {
    return { valid: false, error: 'Only image files are allowed (JPEG, PNG, GIF, WebP, SVG)' };
  }

  // Validate file extension as additional check
  const fileName = file.name.toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

  if (!hasValidExtension) {
    return { valid: false, error: 'File extension not allowed' };
  }

  return { valid: true };
};

/**
 * Sanitize error message to prevent information leakage
 */
export const sanitizeErrorMessage = (error: unknown, defaultMessage: string = 'An error occurred'): string => {
  if (!error) {
    return defaultMessage;
  }

  let message = '';
  
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else {
    return defaultMessage;
  }

  // Remove sensitive information patterns
  // Don't expose API keys, tokens, or internal paths
  message = message.replace(/[A-Za-z0-9_-]{20,}/g, (match) => {
    // If it looks like a JWT token or API key, mask it
    if (match.length > 50 || match.includes('eyJ')) {
      return '[REDACTED]';
    }
    return match;
  });

  // Remove file paths
  message = message.replace(/[A-Z]:\\[^\s]+/g, '[REDACTED]');
  message = message.replace(/\/[^\s]+/g, '[REDACTED]');

  // Remove stack traces
  message = message.split('\n')[0];

  // Sanitize the message
  message = sanitizeString(message, 500);

  return message || defaultMessage;
};

/**
 * Validate IPFS URI/CID format
 */
export const validateIPFSUri = (uri: string): { valid: boolean; error?: string } => {
  if (!uri || typeof uri !== 'string') {
    return { valid: false, error: 'URI is required' };
  }

  const trimmed = uri.trim();

  // Check if it's a valid IPFS URI
  if (!trimmed.startsWith('ipfs://')) {
    return { valid: false, error: 'Invalid IPFS URI format' };
  }

  // Extract CID (should be after ipfs://)
  const cid = trimmed.replace('ipfs://', '').split('/')[0];

  // Basic CID validation (CIDv0 or CIDv1)
  if (!cid || cid.length < 10) {
    return { valid: false, error: 'Invalid IPFS CID' };
  }

  return { valid: true };
};

/**
 * Rate limiting helper (client-side)
 * Note: Real rate limiting should be implemented server-side
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];

    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);

    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }

    // Add current attempt
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);

    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

