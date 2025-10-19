import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedDemoCompany() {
  try {
    // Create demo company
    const company = await prisma.company.upsert({
      where: { code: 'DEMO2024' },
      update: {},
      create: {
        name: 'Demo Company AB',
        code: 'DEMO2024',
        emailDomain: 'company.com',
        isActive: true
      }
    });

    console.log('✅ Demo company created:', company.name);

    // Create demo users with different roles
    const hashedPassword = await bcrypt.hash('demo123', 10);
    
    // Admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@company.com' },
      update: {
        password: hashedPassword,
        isInternal: true,
        companyId: company.id,
        role: 'ADMIN'
      },
      create: {
        email: 'admin@company.com',
        password: hashedPassword,
        name: 'Admin User',
        isInternal: true,
        companyId: company.id,
        role: 'ADMIN',
        profession: 'Administrator',
        company: 'Demo Company AB'
      }
    });

    // Regular user
    const regularUser = await prisma.user.upsert({
      where: { email: 'user@company.com' },
      update: {
        password: hashedPassword,
        isInternal: true,
        companyId: company.id,
        role: 'USER'
      },
      create: {
        email: 'user@company.com',
        password: hashedPassword,
        name: 'Regular User',
        isInternal: true,
        companyId: company.id,
        role: 'USER',
        profession: 'Employee',
        company: 'Demo Company AB'
      }
    });

    // Viewer user
    const viewerUser = await prisma.user.upsert({
      where: { email: 'viewer@company.com' },
      update: {
        password: hashedPassword,
        isInternal: true,
        companyId: company.id,
        role: 'VIEWER'
      },
      create: {
        email: 'viewer@company.com',
        password: hashedPassword,
        name: 'Viewer User',
        isInternal: true,
        companyId: company.id,
        role: 'VIEWER',
        profession: 'Observer',
        company: 'Demo Company AB'
      }
    });

    console.log('✅ Demo users created:');
    console.log('');
    console.log('👑 ADMIN:');
    console.log('   📧 Email: admin@company.com');
    console.log('   🔑 Password: demo123');
    console.log('');
    console.log('👤 USER:');
    console.log('   📧 Email: user@company.com');
    console.log('   🔑 Password: demo123');
    console.log('');
    console.log('👁️  VIEWER:');
    console.log('   📧 Email: viewer@company.com');
    console.log('   🔑 Password: demo123');
    console.log('');
    console.log('🏢 Company Code: DEMO2024');

    // Create an internal bot for the demo company
    const internalBot = await prisma.bot.create({
      data: {
        name: 'Demo Internal Assistant',
        type: 'knowledge',
        companyUrl: 'https://demo.company.com',
        userId: adminUser.id,
        spec: {
          type: 'knowledge',
          subtype: 'internal',
          purpose: 'internal',
          name: 'Demo Internal Assistant',
          welcomeMessage: 'Hi! I\'m your internal company assistant. I can help with policies, procedures, brand guidelines, and more.',
          policies: [
            'Help employees with company policies and procedures',
            'Assist with brand guidelines and resources',
            'Answer questions about internal documentation',
            'Help with Excel formulas and calculations'
          ],
          brand: {
            primaryColor: '#000000',
            tone: 'professional'
          }
        }
      }
    });

    console.log('✅ Internal bot created:', internalBot.id);
    console.log('🤖 Bot URL: /internal/' + internalBot.id);

  } catch (error) {
    console.error('❌ Error seeding demo company:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDemoCompany();
