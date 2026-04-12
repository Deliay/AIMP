import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';

export interface JwtPayload {
  userId: string;
  type: string;
  iat?: number;
  exp?: number;
}

export function verifyJwt(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch {
    throw new Error('Invalid or expired token');
  }
}

export function generateJwt(payload: { userId: string; type: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
