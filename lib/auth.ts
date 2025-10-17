import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AUTH_COOKIE_NAME } from './constants';
export {
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_MAX_AGE,
  AUTH_COOKIE_OPTIONS,
  CLEAR_AUTH_COOKIE_OPTIONS,
} from './constants';

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('Missing JWT_SECRET environment variable');
}

const JWT_SECRET = jwtSecret;

export interface User {
  id: string;
  operator_id: string;
  email: string;
  full_name: string;
  role: string;
}

export interface Operator {
  id: string;
  company_name: string;
  subdomain: string;
  subscription_tier: string;
}

export interface AuthTokenPayload {
  userId: string;
  operatorId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(user: User): string {
  return jwt.sign(
    {
      userId: user.id,
      operatorId: user.operator_id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Verify JWT token
export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch (error) {
    return null;
  }
}

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) {
      return token;
    }
  }

  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) {
    return null;
  }

  const tokenCookie = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${AUTH_COOKIE_NAME}=`));

  if (!tokenCookie) {
    return null;
  }

  const value = tokenCookie.split('=').slice(1).join('=');
  return value ? decodeURIComponent(value) : null;
}

export function authenticateRequest(
  request: Request
): AuthTokenPayload | null {
  const token = getTokenFromRequest(request);
  if (!token) {
    return null;
  }
  return verifyToken(token);
}

// Generate random subdomain
export function generateSubdomain(companyName: string): string {
  const cleaned = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20);
  const random = Math.random().toString(36).substring(2, 6);
  return `${cleaned}-${random}`;
}
