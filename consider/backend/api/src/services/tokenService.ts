/**
 * ============================================================================
 * JWT TOKEN SERVICE
 * ============================================================================
 * 
 * Handles generation and verification of JWT capability tokens.
 * 
 * WHAT IS A CAPABILITY TOKEN?
 * After a user successfully presents valid agent credentials (via VP),
 * we issue them a short-lived JWT token that grants specific capabilities.
 * This token is used for subsequent API calls (like executing agents).
 * 
 * KEY RESPONSIBILITIES:
 * - Generate JWT tokens with custom claims
 * - Verify and decode JWT tokens
 * - Enforce token expiration
 * - Sign tokens with secret key
 * 
 * DATA FLOW:
 * ```
 * Auth Route (after VP verification)
 *   → tokenService.generateToken({ pid, scopes })
 *     → JWT signed with secret
 *       → Token returned to frontend
 *         → Frontend includes token in subsequent requests
 *           → Agent Route verifies token
 *             → tokenService.verifyToken(token)
 *               → Returns claims if valid
 * ```
 * 
 * SECURITY:
 * - Tokens are short-lived (120 seconds by default)
 * - Signed with secret key (never exposed to client)
 * - Cannot be forged without the secret
 * - Expired tokens are rejected
 * 
 * TOKEN STRUCTURE:
 * ```json
 * {
 *   "pid": "privacy-preserving-id",
 *   "audience": "agenticdid.io",
 *   "scopes": ["balance:read", "transfer:write"],
 *   "iat": 1731585600,
 *   "exp": 1731585720
 * }
 * ```
 * 
 * RELATED FILES:
 * @see src/routes/auth.ts - Generates tokens after VP verification
 * @see src/routes/agents.ts - Verifies tokens before agent execution
 * @see src/config.ts - Provides JWT secret and expiration settings
 * 
 * @author AgenticDID Team
 * @version 1.0.0
 * ============================================================================
 */

import { config } from '../config.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Claims embedded in the JWT token
 */
export interface TokenClaims {
  pid: string;
  audience: string;
  scopes: string[];
  iat?: number; // Issued at (unix timestamp)
  exp?: number; // Expiration (unix timestamp)
}

// ============================================================================
// TOKEN SERVICE
// ============================================================================

/**
 * Simple JWT implementation using Web Crypto API
 * 
 * NOTE: In production, you might want to use a library like 'jose' or 
 * '@fastify/jwt', but this implementation shows the core concepts and
 * gives us full control over the token structure.
 */
class TokenService {
  private readonly secret: string;
  private readonly expirationSeconds: number;

  constructor(secret: string, expirationSeconds: number) {
    this.secret = secret;
    this.expirationSeconds = expirationSeconds;
  }

  /**
   * Generate a JWT token with the given claims
   * 
   * PURPOSE:
   * Create a signed token that proves the holder has valid agent credentials
   * and is authorized to perform specific actions.
   * 
   * PROCESS:
   * 1. Add issued-at (iat) and expiration (exp) timestamps
   * 2. Encode claims as base64
   * 3. Sign with HMAC-SHA256 using secret key
   * 4. Return JWT in standard format: header.payload.signature
   * 
   * @param claims - Token payload (pid, audience, scopes)
   * @returns Signed JWT token string
   */
  generateToken(claims: Omit<TokenClaims, 'iat' | 'exp'>): string {
    const now = Math.floor(Date.now() / 1000);
    
    const fullClaims: TokenClaims = {
      ...claims,
      iat: now,
      exp: now + this.expirationSeconds,
    };

    // Create JWT header
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    // Encode header and payload
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(fullClaims));

    // Create signature
    const dataToSign = `${encodedHeader}.${encodedPayload}`;
    const signature = this.sign(dataToSign);

    // Return complete JWT
    return `${dataToSign}.${signature}`;
  }

  /**
   * Verify and decode a JWT token
   * 
   * PURPOSE:
   * Validate that a token is authentic, not expired, and return its claims.
   * 
   * VERIFICATION STEPS:
   * 1. Parse JWT structure (header.payload.signature)
   * 2. Verify signature matches (prevents tampering)
   * 3. Check expiration timestamp
   * 4. Return decoded claims
   * 
   * @param token - JWT token string to verify
   * @returns Token claims if valid, null if invalid/expired
   */
  verifyToken(token: string): TokenClaims | null {
    try {
      // Split JWT into parts
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const [encodedHeader, encodedPayload, providedSignature] = parts;

      // Verify signature
      const dataToVerify = `${encodedHeader}.${encodedPayload}`;
      const expectedSignature = this.sign(dataToVerify);

      if (expectedSignature !== providedSignature) {
        // Token has been tampered with
        return null;
      }

      // Decode payload
      const payload = JSON.parse(this.base64UrlDecode(encodedPayload));
      const claims = payload as TokenClaims;

      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (claims.exp && claims.exp < now) {
        // Token has expired
        return null;
      }

      return claims;
    } catch (error) {
      // Parsing or decoding failed
      return null;
    }
  }

  /**
   * Sign data using HMAC-SHA256
   * 
   * SECURITY:
   * Uses HMAC (Hash-based Message Authentication Code) with SHA-256.
   * Only someone with the secret key can create valid signatures.
   * 
   * @param data - Data to sign
   * @returns Base64-URL encoded signature
   */
  private sign(data: string): string {
    // Simple HMAC-SHA256 implementation using Bun's crypto
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(data);
    const keyBytes = encoder.encode(this.secret);

    // Create HMAC
    const hmac = new Bun.CryptoHasher('sha256', keyBytes);
    hmac.update(dataBytes);
    const signature = hmac.digest();

    return this.base64UrlEncode(Buffer.from(signature).toString('base64'));
  }

  /**
   * Base64-URL encode a string
   * 
   * NOTE: JWT uses a URL-safe variant of base64 that replaces
   * '+' with '-' and '/' with '_', and removes '=' padding.
   */
  private base64UrlEncode(str: string): string {
    const base64 = Buffer.from(str).toString('base64');
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Base64-URL decode a string
   */
  private base64UrlDecode(str: string): string {
    // Add back padding
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return Buffer.from(base64, 'base64').toString('utf-8');
  }

  /**
   * Get token expiration in seconds
   * 
   * USAGE:
   * Used by auth routes to tell frontend how long the token is valid.
   * Frontend can show a countdown or automatically re-authenticate.
   */
  getExpirationSeconds(): number {
    return this.expirationSeconds;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

/**
 * Singleton token service instance
 * 
 * RATIONALE:
 * We create one instance with config values and export it.
 * All routes and middleware can import and use the same instance.
 */
export const tokenService = new TokenService(
  config.security.jwtSecret,
  config.security.tokenExpirationSeconds
);

/**
 * ============================================================================
 * EXPORT
 * ============================================================================
 */

export default tokenService;
