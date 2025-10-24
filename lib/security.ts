import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export interface JWTPayload {
  userId: number;
  email: string;
  organizationId?: number;
  role: 'super_admin' | 'org_admin' | 'org_user';
  exp?: number;
  iat?: number;
}

// Authenticate and authorize user
export async function authenticateRequest(
  request: NextRequest,
  options?: {
    requireOrgId?: boolean;
    allowedRoles?: string[];
    checkOrgMatch?: number;
  }
): Promise<{ authorized: boolean; user?: JWTPayload; error?: NextResponse }> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authorized: false,
      error: NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    };
  }

  const token = authHeader.substring(7);
  let decoded: JWTPayload;

  try {
    decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return {
      authorized: false,
      error: NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    };
  }

  // Check token expiration
  if (decoded.exp && Date.now() >= decoded.exp * 1000) {
    return {
      authorized: false,
      error: NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    };
  }

  // Check if organization ID is required but missing
  if (options?.requireOrgId && !decoded.organizationId) {
    return {
      authorized: false,
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    };
  }

  // Check if user has required role
  if (options?.allowedRoles && !options.allowedRoles.includes(decoded.role)) {
    return {
      authorized: false,
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    };
  }

  // Check if organization ID matches requested resource
  if (options?.checkOrgMatch && decoded.organizationId !== options.checkOrgMatch) {
    return {
      authorized: false,
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    };
  }

  return { authorized: true, user: decoded };
}

// Input validation helpers
export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
  },

  phone: (phone: string): boolean => {
    // Allow international phone numbers with optional + and spaces/dashes
    const phoneRegex = /^[+]?[\d\s-()]{10,20}$/;
    return phoneRegex.test(phone);
  },

  name: (name: string): boolean => {
    return name.length > 0 && name.length <= 100;
  },

  status: (status: string): boolean => {
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'all'];
    return validStatuses.includes(status);
  },

  date: (dateStr: string): boolean => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) return false;
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  },

  positiveInteger: (num: any, min: number = 1, max: number = 100): boolean => {
    return Number.isInteger(num) && num >= min && num <= max;
  },

  hotelCategory: (category: string): boolean => {
    return ['3', '4', '5'].includes(category);
  },

  tourType: (type: string): boolean => {
    return ['SIC', 'PRIVATE'].includes(type);
  },

  cityNights: (cityNights: any): boolean => {
    if (!Array.isArray(cityNights) || cityNights.length === 0) return false;

    return cityNights.every((cn: any) =>
      typeof cn === 'object' &&
      typeof cn.city === 'string' &&
      cn.city.length > 0 &&
      cn.city.length <= 100 &&
      Number.isInteger(cn.nights) &&
      cn.nights >= 1 &&
      cn.nights <= 30
    );
  },

  specialRequests: (text: string): boolean => {
    // Allow empty or up to 1000 characters, no dangerous keywords
    if (!text) return true;
    if (text.length > 1000) return false;

    // Check for prompt injection attempts
    const dangerousPatterns = /IGNORE|SYSTEM|PROMPT|OVERRIDE|INSTRUCTIONS/gi;
    return !dangerousPatterns.test(text);
  },

  searchQuery: (query: string): boolean => {
    // City search should be alphanumeric with spaces/dashes, max 50 chars
    if (query.length > 50) return false;
    const searchRegex = /^[a-zA-Z\s-]*$/;
    return searchRegex.test(query);
  }
};

// Sanitize text to prevent injection
export function sanitizeText(text: string, maxLength: number = 1000): string {
  if (!text) return '';

  return text
    .replace(/IGNORE/gi, '')
    .replace(/SYSTEM/gi, '')
    .replace(/PROMPT/gi, '')
    .replace(/OVERRIDE/gi, '')
    .replace(/INSTRUCTIONS/gi, '')
    .slice(0, maxLength)
    .trim();
}

// Validate and sanitize itinerary data
export function validateItineraryRequest(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!validators.cityNights(data.city_nights)) {
    errors.push('Invalid city_nights format or values');
  }

  if (!validators.date(data.start_date)) {
    errors.push('Invalid start_date format');
  }

  if (!validators.positiveInteger(data.adults, 1, 50)) {
    errors.push('Invalid adults count (must be 1-50)');
  }

  if (data.children !== undefined && !validators.positiveInteger(data.children, 0, 50)) {
    errors.push('Invalid children count (must be 0-50)');
  }

  if (!validators.hotelCategory(data.hotel_category)) {
    errors.push('Invalid hotel_category (must be 3, 4, or 5)');
  }

  if (!validators.tourType(data.tour_type)) {
    errors.push('Invalid tour_type (must be SIC or PRIVATE)');
  }

  if (data.special_requests && !validators.specialRequests(data.special_requests)) {
    errors.push('Invalid special_requests (too long or contains prohibited content)');
  }

  return { valid: errors.length === 0, errors };
}

// Validate customer contact info
export function validateCustomerInfo(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.customer_name || !validators.name(data.customer_name)) {
    errors.push('Invalid customer name (1-100 characters required)');
  }

  if (!data.customer_email || !validators.email(data.customer_email)) {
    errors.push('Invalid email format');
  }

  if (data.customer_phone && !validators.phone(data.customer_phone)) {
    errors.push('Invalid phone number format');
  }

  return { valid: errors.length === 0, errors };
}

// Rate limiting store (in-memory, should use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    // New window
    const resetTime = now + windowMs;
    rateLimitStore.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }

  if (record.count >= maxRequests) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  // Increment count
  record.count++;
  rateLimitStore.set(identifier, record);
  return { allowed: true, remaining: maxRequests - record.count, resetTime: record.resetTime };
}

// Get client IP for rate limiting
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0].trim() || real || 'unknown';
}

// Clean up expired rate limit entries (run periodically)
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}
