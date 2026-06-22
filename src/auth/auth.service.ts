import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const DEFAULT_JWT_SECRET = 'default-dev-secret-key-montilla-98765';

export class AuthService {
  private static getSecret(): string {
    return process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
  }

  // Hash a plain text password
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  // Compare text with safe hash
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate JWT token
  static generateToken(payload: { userId: string; email: string }): string {
    const secret = this.getSecret();
    // Expiry of 7 days
    return jwt.sign(payload, secret, { expiresIn: '7d' });
  }

  // Verify JWT token and decode
  static verifyToken(token: string): { userId: string; email: string } | null {
    try {
      const secret = this.getSecret();
      return jwt.verify(token, secret) as { userId: string; email: string };
    } catch (err) {
      return null;
    }
  }

  // Middleware helper to authenticate requests
  static getAuthUserFromRequest(headers: Record<string, string | string[] | undefined>): { userId: string; email: string } | null {
    const authHeader = headers['authorization'];
    if (!authHeader || typeof authHeader !== 'string') return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') return null;

    const token = parts[1];
    return this.verifyToken(token);
  }
}
