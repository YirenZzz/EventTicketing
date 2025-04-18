import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Delete existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.purchasedTicket.deleteMany({});
  await prisma.checkIn.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.promoCode.deleteMany({});
  await prisma.ticketType.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.user.deleteMany({});

  // Create admin user
  console.log('👤 Creating admin user...');
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123', // In production, this should be hashed
      role: 'Organizer',
    },
  });

  // Create staff user
  console.log('👤 Creating staff user...');
  const staffUser = await prisma.user.create({
    data: {
      name: 'Staff User',
      email: 'staff@example.com',
      password: 'staff123', // In production, this should be hashed
      role: 'Staff',
    },
  });

  // Create attendee user
  console.log('👤 Creating attendee user...');
  const attendeeUser = await prisma.user.create({
    data: {
      name: 'Attendee User',
      email: 'attendee@example.com',
      password: 'attendee123', // In production, this should be hashed
      role: 'Attendee',
    },
  });

  // Create a sample event
  console.log('📅 Creating sample event...');
  const event = await prisma.event.create({
    data: {
      name: 'Sample Conference 2025',
      description: 'A fantastic tech conference with amazing speakers',
      startDate: new Date('2025-06-01T09:00:00Z'),
      endDate: new Date('2025-06-03T18:00:00Z'),
      location: 'Convention Center, New York',
      organizerId: adminUser.id,
      coverImage: 'https://placehold.co/600x400',
      status: 'UPCOMING',
    },
  });

  // Create ticket types for the event
  console.log('🎟️ Creating ticket types...');
  const vipTicketType = await prisma.ticketType.create({
    data: {
      name: 'VIP',
      price: 499.99,
      quantity: 100,
      eventId: event.id,
    },
  });

  const regularTicketType = await prisma.ticketType.create({
    data: {
      name: 'Regular',
      price: 199.99,
      quantity: 500,
      eventId: event.id,
    },
  });

  // Create a promo code
  console.log('🏷️ Creating promo code...');
  await prisma.promoCode.create({
    data: {
      code: 'SUMMER25',
      type: 'percentage',
      amount: 25,
      maxUsage: 100,
      startDate: new Date('2025-05-01T00:00:00Z'),
      endDate: new Date('2025-05-31T23:59:59Z'),
      eventId: event.id,
      ticketTypeId: regularTicketType.id,
    },
  });

  // Create some tickets
  console.log('🎫 Creating tickets...');
  const tickets = [];
  
  // Create 5 VIP tickets
  for (let i = 0; i < 5; i++) {
    const ticketCode = `VIP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    tickets.push({
      ticketTypeId: vipTicketType.id,
      code: ticketCode,
    });
  }
  
  // Create 10 regular tickets
  for (let i = 0; i < 10; i++) {
    const ticketCode = `REG-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    tickets.push({
      ticketTypeId: regularTicketType.id,
      code: ticketCode,
    });
  }
  
  await prisma.ticket.createMany({
    data: tickets,
  });

  // Purchase a ticket for the attendee
  console.log('💰 Creating a purchased ticket...');
  const ticketToPurchase = await prisma.ticket.findFirst({
    where: {
      ticketTypeId: regularTicketType.id,
      purchased: false,
    },
  });

  if (ticketToPurchase) {
    await prisma.ticket.update({
      where: { id: ticketToPurchase.id },
      data: { purchased: true },
    });

    await prisma.purchasedTicket.create({
      data: {
        userId: attendeeUser.id,
        ticketId: ticketToPurchase.id,
      },
    });
  }

  console.log('✅ Seed data inserted successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });