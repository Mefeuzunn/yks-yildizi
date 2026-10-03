import { SignJWT, jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev-local-jwt-secret-do-not-use-in-prod');
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('FATAL: JWT_SECRET environment variable is missing in production.');
}
const encodedKey = new TextEncoder().encode(secretKey);

export async function signToken(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(encodedKey);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}
