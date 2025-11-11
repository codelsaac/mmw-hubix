/**
 * Input Sanitizer - XSS Prevention Utilities
 * 
 * For full HTML sanitization, install: npm install isomorphic-dompurify
 * Then uncomment the DOMPurify import and use sanitizeHtml method
 */

// import DOMPurify from 'isomorphic-dompurify';

export class InputSanitizer {
  /**
   * Sanitize HTML content (basic version)
   * For production, install isomorphic-dompurify for better sanitization
   */
  static sanitizeHtml(dirty: string): string {
    // Basic HTML sanitization - remove script tags and event handlers
    const clean = dirty
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
      .replace(/javascript:/gi, '');

    // For production use with isomorphic-dompurify:
    // return DOMPurify.sanitize(dirty, {
    //   ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a'],
    //   ALLOWED_ATTR: ['href', 'title', 'target'],
    // });

    return clean;
  }

  /**
   * Sanitize plain text input
   */
  static sanitizeText(input: string): string {
    if (!input) return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove HTML brackets
      .substring(0, 10000); // Limit length
  }

  /**
   * Validate and sanitize URL
   */
  static sanitizeUrl(url: string): string | null {
    if (!url) return null;

    try {
      const parsed = new URL(url);
      
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return null;
      }

      return parsed.toString();
    } catch {
      return null;
    }
  }

  /**
   * Sanitize file name
   */
  static sanitizeFileName(fileName: string): string {
    if (!fileName) return 'unnamed';

    return fileName
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe characters
      .replace(/\.{2,}/g, '.') // Prevent directory traversal
      .replace(/^\.+/, '') // Remove leading dots
      .substring(0, 255); // Limit length
  }

  /**
   * Sanitize email address
   */
  static sanitizeEmail(email: string): string | null {
    if (!email) return null;

    const trimmed = email.trim().toLowerCase();
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(trimmed)) {
      return null;
    }

    return trimmed;
  }

  /**
   * Sanitize phone number (remove non-digits)
   */
  static sanitizePhone(phone: string): string {
    if (!phone) return '';
    
    return phone.replace(/\D/g, ''); // Keep only digits
  }

  /**
   * Sanitize username (alphanumeric + underscore only)
   */
  static sanitizeUsername(username: string): string | null {
    if (!username) return null;

    const trimmed = username.trim().toLowerCase();
    
    // Only allow alphanumeric and underscore
    if (!/^[a-z0-9_]+$/.test(trimmed)) {
      return null;
    }

    // Length constraints
    if (trimmed.length < 3 || trimmed.length > 30) {
      return null;
    }

    return trimmed;
  }

  /**
   * Sanitize number input
   */
  static sanitizeNumber(value: any): number | null {
    const num = Number(value);
    
    if (isNaN(num) || !isFinite(num)) {
      return null;
    }

    return num;
  }

  /**
   * Sanitize integer input
   */
  static sanitizeInteger(value: any): number | null {
    const num = this.sanitizeNumber(value);
    
    if (num === null) return null;
    
    return Math.floor(num);
  }

  /**
   * Sanitize boolean input
   */
  static sanitizeBoolean(value: any): boolean {
    if (typeof value === 'boolean') return value;
    
    const str = String(value).toLowerCase();
    return str === 'true' || str === '1' || str === 'yes';
  }

  /**
   * Sanitize JSON input
   */
  static sanitizeJson<T = any>(input: string): T | null {
    try {
      return JSON.parse(input) as T;
    } catch {
      return null;
    }
  }

  /**
   * Remove null bytes (security risk)
   */
  static removeNullBytes(input: string): string {
    return input.replace(/\0/g, '');
  }

  /**
   * Escape HTML for display
   */
  static escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Sanitize SQL LIKE pattern (prevent SQL injection in LIKE clauses)
   */
  static sanitizeLikePattern(pattern: string): string {
    return pattern
      .replace(/[%_\\]/g, '\\$&') // Escape LIKE wildcards
      .substring(0, 100); // Limit length
  }

  /**
   * Validate and sanitize multiple inputs at once
   */
  static sanitizeObject<T extends Record<string, any>>(
    obj: T,
    rules: Partial<Record<keyof T, 'text' | 'html' | 'url' | 'email' | 'number' | 'boolean'>>
  ): Partial<T> {
    const sanitized: any = {};

    for (const [key, rule] of Object.entries(rules)) {
      const value = obj[key as keyof T];

      switch (rule) {
        case 'text':
          sanitized[key] = this.sanitizeText(value);
          break;
        case 'html':
          sanitized[key] = this.sanitizeHtml(value);
          break;
        case 'url':
          sanitized[key] = this.sanitizeUrl(value);
          break;
        case 'email':
          sanitized[key] = this.sanitizeEmail(value);
          break;
        case 'number':
          sanitized[key] = this.sanitizeNumber(value);
          break;
        case 'boolean':
          sanitized[key] = this.sanitizeBoolean(value);
          break;
      }
    }

    return sanitized as Partial<T>;
  }
}

/**
 * Validator utilities (work with Zod schemas)
 */
export class InputValidator {
  /**
   * Check if string is a valid CUID
   */
  static isCuid(value: string): boolean {
    return /^c[a-z0-9]{24}$/.test(value);
  }

  /**
   * Check if string is a valid UUID
   */
  static isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  }

  /**
   * Check if string is a valid date
   */
  static isValidDate(value: string): boolean {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }

  /**
   * Check if string contains only safe characters
   */
  static isSafeString(value: string): boolean {
    // No null bytes, no control characters
    return !/[\0\x00-\x1F\x7F]/.test(value);
  }
}
