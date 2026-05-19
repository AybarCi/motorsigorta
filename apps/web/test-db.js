const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const leads = await prisma.lead.findMany();
  console.log("Leads in DB:", leads.length);
}
main().catch(console.error).finally(() => prisma.$disconnect());
