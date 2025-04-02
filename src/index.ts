import { PrismaClient } from "@prisma/client";
import { readdir } from "node:fs/promises";

const prisma = new PrismaClient();

const datasetPath = "storage/datasets/cryptocurrencyjobs_1743613299";

// Read directory contents
const files = await readdir(datasetPath);

console.log("Files in dataset directory:");
for (const file of files) {
  const filePath = `${datasetPath}/${file}`;
  const contentJson = await Bun.file(filePath).json();
  console.log(`\nFile: ${file}`);
  console.log("Content:", contentJson);
}
