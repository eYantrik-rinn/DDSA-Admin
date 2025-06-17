import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';
const JWT_EXPIRES_IN = '7d'; // Token expiration time

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user) {
  // user should be an object with at least an _id property
  return jwt.sign(
    {
      _id: user._id,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
