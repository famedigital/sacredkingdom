import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
// Longer access window so admin can edit tours/blogs without mid-save logout.
// Refresh token still renews the session in the background.
const JWT_EXPIRES_IN: jwt.SignOptions['expiresIn'] = '12h';
const REFRESH_TOKEN_EXPIRES_IN: jwt.SignOptions['expiresIn'] = '30d';
const ACCESS_TOKEN_MAX_AGE_SEC = 12 * 60 * 60; // keep cookie in sync with ~12h JWT
const REFRESH_TOKEN_MAX_AGE_SEC = 30 * 24 * 60 * 60;

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
  permissions?: string[]; // Include permissions in token for RBAC
}

function signingPayload(payload: TokenPayload): TokenPayload {
  const decoded = payload as TokenPayload & { exp?: number; iat?: number; nbf?: number }
  return {
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role,
    name: decoded.name,
    permissions: Array.isArray(decoded.permissions) ? decoded.permissions : [],
  }
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate JWT access token with enhanced payload
 */
export function generateAccessToken(payload: TokenPayload): string {
  try {
    return jwt.sign(signingPayload(payload), JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  } catch (error) {
    console.error('Error generating access token:', error);
    throw new Error('Failed to generate access token');
  }
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(payload: TokenPayload): string {
  try {
    return jwt.sign(signingPayload(payload), JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });
  } catch (error) {
    console.error('Error generating refresh token:', error);
    throw new Error('Failed to generate refresh token');
  }
}

/**
 * Generate both access and refresh tokens
 */
export function generateAuthTokens(payload: TokenPayload): AuthTokens {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

/**
 * Verify JWT token with enhanced error handling
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    if (!token || typeof token !== 'string') {
      console.warn('Invalid token provided to verifyToken');
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.warn('Token expired:', error.message);
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.warn('Invalid token:', error.message);
    } else {
      console.error('Error verifying token:', error);
    }
    return null;
  }
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    return bcrypt.hash(password, 12); // 12 salt rounds
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  try {
    return bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Error comparing password:', error);
    return false;
  }
}

/**
 * Set authentication cookies with enhanced options
 */
export async function setAuthCookies(tokens: AuthTokens) {
  try {
    const cookieStore = await cookies();

    // Access token cookie (httpOnly for security)
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      // Only set domain when explicitly configured (undefined domain breaks cookies on Vercel)
      ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
    };

    cookieStore.set('access_token', tokens.accessToken, {
      ...cookieOptions,
      maxAge: ACCESS_TOKEN_MAX_AGE_SEC,
    });

    cookieStore.set('refresh_token', tokens.refreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_TOKEN_MAX_AGE_SEC,
    });

    console.log('Auth cookies set successfully');
  } catch (error) {
    console.error('Error setting auth cookies:', error);
    throw new Error('Failed to set authentication cookies');
  }
}

/**
 * Clear authentication cookies
 */
export async function clearAuthCookies() {
  try {
    const cookieStore = await cookies();

    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');

    console.log('Auth cookies cleared successfully');
  } catch (error) {
    console.error('Error clearing auth cookies:', error);
  }
}

/**
 * Get current user from request with enhanced error handling.
 * If the access token is missing/expired, silently refresh from the refresh token.
 */
export async function getCurrentUser(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (accessToken) {
      const payload = verifyToken(accessToken);
      if (payload) return payload;
    }

    // Access token missing or expired — try refresh token
    const newAccessToken = await refreshAccessToken();
    if (!newAccessToken) {
      if (!accessToken) {
        console.log('No access token found in cookies');
      } else {
        console.log('Failed to verify access token and refresh failed');
      }
      return null;
    }

    return verifyToken(newAccessToken);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Refresh access token using refresh token with enhanced error handling
 */
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
      console.log('No refresh token found in cookies');
      return null;
    }

    const payload = verifyToken(refreshToken);
    if (!payload) {
      console.log('Failed to verify refresh token');
      return null;
    }

    const newAccessToken = generateAccessToken(payload);

    // Set new access token cookie
    cookieStore.set('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ACCESS_TOKEN_MAX_AGE_SEC,
      path: '/',
      ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
    });

    // Sliding refresh — extend refresh cookie while the admin stays active
    cookieStore.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_MAX_AGE_SEC,
      path: '/',
      ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
    });

    console.log('Access token refreshed successfully');
    return newAccessToken;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return null;
  }
}