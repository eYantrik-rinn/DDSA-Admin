// Create test users for the exam application
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createTestUsers() {
  console.log('Creating test users...');
  
  try {
    // Create an admin user
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const adminUser = await prisma.examUser.create({
      data: {
        email: 'admin@example.com',
        username: 'admin',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true
      }
    });
    console.log('Created admin user:', adminUser.email);
    
    // Create a regular user
    const userPassword = await bcrypt.hash('User@123', 10);
    const regularUser = await prisma.examUser.create({
      data: {
        email: 'user@example.com',
        username: 'user',
        password: userPassword,
        firstName: 'Regular',
        lastName: 'User',
        role: 'USER',
        isActive: true
      }
    });
    console.log('Created regular user:', regularUser.email);
    
    console.log('Test users created successfully!');
  } catch (error) {
    // Check if the error is about duplicate users
    if (error.code === 'P2002') {
      console.log('Users already exist. Skipping user creation.');
    } else {
      console.error('Error creating test users:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();
