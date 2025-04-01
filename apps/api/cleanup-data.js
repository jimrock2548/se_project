const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting data cleanup...');
    
    // ตรวจสอบโครงสร้างตาราง Message
    console.log('Checking Message table structure...');
    const messageTableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Message';
    `;
    console.log('Message table structure:', messageTableInfo);
    
    // ลบข้อมูล Message ที่เกี่ยวข้องกับ User
    console.log('Deleting messages...');
    await prisma.message.deleteMany({});
    
    console.log('Data cleanup completed successfully!');
  } catch (error) {
    console.error('Error during data cleanup:', error);
    throw error;
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });