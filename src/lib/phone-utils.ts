/**
 * Phone number formatting and validation utilities
 */

/**
 * Formats a phone number as the user types
 * Supports various input formats and converts to international format
 */
export function formatPhoneNumber(value: string): string {
  // Remove all non-digit characters
  const digitsOnly = value.replace(/\D/g, '');
  
  // If empty, return empty string
  if (!digitsOnly) {
    return '';
  }
  
  // Prepend '+' to the digits to ensure international format with no spaces or hyphens
  return `+${digitsOnly}`;
}

/**
 * Extracts clean phone number from formatted string
 * Returns phone number with country code
 */
export function extractPhoneNumber(formattedPhone: string): string {
  const cleaned = formattedPhone.replace(/\D/g, '');
  
  // If it's a US number (10 digits), add +1
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  
  // If it already has country code, add +
  if (cleaned.length > 10) {
    return `+${cleaned}`;
  }
  
  // For other cases, return as is with +
  return `+${cleaned}`;
}

/**
 * Validates phone number format
 * Returns validation result with error message if invalid
 */
export function validatePhoneNumber(phone: string): { isValid: boolean; error?: string } {
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if empty
  if (!cleaned) {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  // Check minimum length (7 digits minimum for international)
  if (cleaned.length < 7) {
    return { isValid: false, error: 'Phone number is too short' };
  }
  
  // Check maximum length (15 digits maximum for international)
  if (cleaned.length > 15) {
    return { isValid: false, error: 'Phone number is too long' };
  }
  
  // Check for valid characters (only digits)
  if (!/^\d+$/.test(cleaned)) {
    return { isValid: false, error: 'Phone number can only contain digits' };
  }
  
  // Check for US number format (10 or 11 digits)
  if (cleaned.length === 10 || (cleaned.length === 11 && cleaned.startsWith('1'))) {
    return { isValid: true };
  }
  
  // Check for international format (7-15 digits with country code)
  if (cleaned.length >= 7 && cleaned.length <= 15) {
    return { isValid: true };
  }
  
  return { isValid: false, error: 'Please enter a valid phone number' };
}

/**
 * Gets placeholder text based on country
 */
export function getPhonePlaceholder(): string {
  return '+1 (555) 123-4567';
}

/**
 * Formats phone number for display
 */
export function displayPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone;
}
