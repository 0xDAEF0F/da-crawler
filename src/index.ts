import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const job = await prisma.job.create({
  data: { title: "Software Engineer" },
});

console.log(job);
