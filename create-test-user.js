// Script to create a test admin user
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createTestUser() {
  console.log('Creating test admin user...');
  
  try {
    // Check if user already exists
    const existingUser = await prisma.examUser.findUnique({
      where: {
        email: 'admin@example.com'
      }
    });

    if (existingUser) {
      console.log('User admin@example.com already exists');
      return;
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('Password123!', saltRounds);
    
    // Create the user
    const user = await prisma.examUser.create({
      data: {
        email: 'admin@example.com',
        username: 'admin',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true
      }
    });
    
    console.log('Created test user:', user);
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser()
  .catch((e) => {
    console.error('Unhandled error:', e);
    process.exit(1);
  });
