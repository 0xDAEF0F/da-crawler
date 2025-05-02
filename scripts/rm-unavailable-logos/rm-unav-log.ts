import { isFetch200 } from "@/utils";
import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();

  const companies = await prisma.company.findMany({
    where: { logoUrl: { not: null } },
  });

  for (const company of companies) {
    const isAvailable = await isFetch200(company.logoUrl!);

    if (!isAvailable) {
      console.log(`Removing logo for ${company.name}`);

      await prisma.company.update({
        where: { id: company.id },
        data: { logoUrl: null },
      });
    }
  }
}

main().catch(console.error);
