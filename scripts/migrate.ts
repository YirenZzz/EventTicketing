import { execSync } from 'child_process';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('📦 Starting database migration...');

try {
  // Create migrations from schema.prisma
  console.log('🔄 Creating migrations...');
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
  
  // Generate Prisma client
  console.log('⚙️ Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('✅ Database migration completed successfully!');
} catch (error) {
  console.error('❌ Error during database migration:', error);
  process.exit(1);
}